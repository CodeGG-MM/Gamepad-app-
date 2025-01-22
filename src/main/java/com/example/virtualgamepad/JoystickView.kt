    package com.example.virtualgamepad

    import android.content.Context
    import android.graphics.Canvas
    import android.graphics.Color
    import android.graphics.Paint
    import android.util.AttributeSet
    import android.view.MotionEvent
    import android.view.View
    import kotlin.math.sqrt

    class JoystickView(context: Context, attrs: AttributeSet? = null) : View(context, attrs) {

        private val joystickPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.GRAY
        }
        private val handlePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.RED
        }
        private var centerX: Float = 0f
        private var centerY: Float = 0f
        private var handleX: Float = 0f
        private var handleY: Float = 0f
        private var joystickRadius: Float = 0f
        private var handleRadius: Float = 0f
        var onMove: ((x: Double, y: Double) -> Unit)? = null

        init {
            isFocusable = true
            isFocusableInTouchMode = true
        }

        override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
            super.onSizeChanged(w, h, oldw, oldh)
            centerX = w / 2f
            centerY = h / 2f
            joystickRadius = Math.min(w, h) / 2f
            handleRadius = joystickRadius / 3f
            handleX = centerX
            handleY = centerY
        }

        override fun onDraw(canvas: Canvas) {
            super.onDraw(canvas)
            canvas.drawCircle(centerX, centerY, joystickRadius, joystickPaint)
            canvas.drawCircle(handleX, handleY, handleRadius, handlePaint)
        }

        override fun onTouchEvent(event: MotionEvent): Boolean {
            when (event.action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_MOVE -> {
                    val x = event.x
                    val y = event.y
                    val deltaX = x - centerX
                    val deltaY = y - centerY
                    val distance = sqrt(deltaX * deltaX + deltaY * deltaY)
                    val maxDistance = joystickRadius

                    val normalizedX = Math.min(1f, Math.max(-1f, deltaX / maxDistance))
                    val normalizedY = Math.min(1f, Math.max(-1f, deltaY / maxDistance))

                    handleX = centerX + (normalizedX * maxDistance * 0.8f)
                    handleY = centerY + (normalizedY * maxDistance * 0.8f)
                    invalidate()
                    onMove?.invoke(normalizedX.toDouble(), normalizedY.toDouble())
                    return true
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    handleX = centerX
                    handleY = centerY
                    invalidate()
                    onMove?.invoke(0.0, 0.0)
                    return true
                }
            }
            return super.onTouchEvent(event)
        }
    }
