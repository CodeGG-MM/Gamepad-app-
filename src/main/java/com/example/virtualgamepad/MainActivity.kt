    package com.example.virtualgamepad

    import android.content.Context
    import android.content.Intent
    import android.content.SharedPreferences
    import android.os.Bundle
    import android.util.Log
    import android.widget.Button
    import android.widget.TextView
    import androidx.appcompat.app.AppCompatActivity
    import org.java_websocket.client.WebSocketClient
    import org.java_websocket.handshake.ServerHandshake
    import java.net.URI
    import org.json.JSONObject

    class MainActivity : AppCompatActivity() {

        private lateinit var connectionStatus: TextView
        private lateinit var settingsButton: Button
        private lateinit var l1Button: Button
        private lateinit var l2Button: Button
        private lateinit var r1Button: Button
        private lateinit var r2Button: Button
        private lateinit var upButton: Button
        private lateinit var leftButton: Button
        private lateinit var rightButton: Button
        private lateinit var downButton: Button
        private lateinit var yButton: Button
        private lateinit var xButton: Button
        private lateinit var bButton: Button
        private lateinit var aButton: Button
        private lateinit var selectButton: Button
        private lateinit var startButton: Button
        private lateinit var movementJoystick: JoystickView
        private lateinit var cameraJoystick: JoystickView
        private var webSocketClient: WebSocketClient? = null
        private var serverAddress: String = ""
        private lateinit var sharedPreferences: SharedPreferences
        private lateinit var buttonMappings: MutableMap<String, String>

        override fun onCreate(savedInstanceState: Bundle?) {
            super.onCreate(savedInstanceState)
            setTheme(getThemeFromPreferences())
            setContentView(R.layout.activity_main)

            connectionStatus = findViewById(R.id.connectionStatus)
            settingsButton = findViewById(R.id.settingsButton)
            l1Button = findViewById(R.id.l1Button)
            l2Button = findViewById(R.id.l2Button)
            r1Button = findViewById(R.id.r1Button)
            r2Button = findViewById(R.id.r2Button)
            upButton = findViewById(R.id.upButton)
            leftButton = findViewById(R.id.leftButton)
            rightButton = findViewById(R.id.rightButton)
            downButton = findViewById(R.id.downButton)
            yButton = findViewById(R.id.yButton)
            xButton = findViewById(R.id.xButton)
            bButton = findViewById(R.id.bButton)
            aButton = findViewById(R.id.aButton)
            selectButton = findViewById(R.id.selectButton)
            startButton = findViewById(R.id.startButton)
            movementJoystick = findViewById(R.id.movementJoystick)
            cameraJoystick = findViewById(R.id.cameraJoystick)

            sharedPreferences = getSharedPreferences("GamepadPrefs", Context.MODE_PRIVATE)
            serverAddress = sharedPreferences.getString("serverAddress", "") ?: ""
            loadButtonMappings()

            settingsButton.setOnClickListener {
                val intent = Intent(this, SettingsActivity::class.java)
                startActivity(intent)
            }

            setupButtonListeners()
            setupJoystickListeners()
            connectWebSocket()
        }

        override fun onResume() {
            super.onResume()
            setTheme(getThemeFromPreferences())
            recreate()
        }

        private fun setupButtonListeners() {
            l1Button.setOnClickListener { sendCommand(buttonMappings["L1"] ?: "L1") }
            l2Button.setOnClickListener { sendCommand(buttonMappings["L2"] ?: "L2") }
            r1Button.setOnClickListener { sendCommand(buttonMappings["R1"] ?: "R1") }
            r2Button.setOnClickListener { sendCommand(buttonMappings["R2"] ?: "R2") }
            upButton.setOnClickListener { sendCommand(buttonMappings["Up"] ?: "DPAD_UP") }
            leftButton.setOnClickListener { sendCommand(buttonMappings["Left"] ?: "DPAD_LEFT") }
            rightButton.setOnClickListener { sendCommand(buttonMappings["Right"] ?: "DPAD_RIGHT") }
            downButton.setOnClickListener { sendCommand(buttonMappings["Down"] ?: "DPAD_DOWN") }
            yButton.setOnClickListener { sendCommand(buttonMappings["Y"] ?: "BUTTON_Y") }
            xButton.setOnClickListener { sendCommand(buttonMappings["X"] ?: "BUTTON_X") }
            bButton.setOnClickListener { sendCommand(buttonMappings["B"] ?: "BUTTON_B") }
            aButton.setOnClickListener { sendCommand(buttonMappings["A"] ?: "BUTTON_A") }
            selectButton.setOnClickListener { sendCommand(buttonMappings["Select"] ?: "SELECT") }
            startButton.setOnClickListener { sendCommand(buttonMappings["Start"] ?: "START") }
        }

        private fun setupJoystickListeners() {
            movementJoystick.onMove = { x, y ->
                sendCommand("MOVEMENT_JOYSTICK_${x.format(2)}_${y.format(2)}")
            }
            cameraJoystick.onMove = { x, y ->
                sendCommand("CAMERA_JOYSTICK_${x.format(2)}_${y.format(2)}")
            }
        }

        private fun connectWebSocket() {
            if (serverAddress.isEmpty()) {
                return
            }
            try {
                val uri = URI("ws://$serverAddress:8000")
                webSocketClient = object : WebSocketClient(uri) {
                    override fun onOpen(handshakedata: ServerHandshake?) {
                        runOnUiThread {
                            connectionStatus.text = "Connected"
                        }
                    }

                    override fun onMessage(message: String?) {
                        Log.d("WebSocket", "Message: $message")
                    }

                    override fun onClose(code: Int, reason: String?, remote: Boolean) {
                        runOnUiThread {
                            connectionStatus.text = "Disconnected"
                        }
                    }

                    override fun onError(ex: Exception?) {
                        runOnUiThread {
                            connectionStatus.text = "Connection Error"
                        }
                        Log.e("WebSocket", "Error: ${ex?.message}")
                    }
                }
                webSocketClient?.connect()
            } catch (e: Exception) {
                Log.e("WebSocket", "Error creating WebSocket: ${e.message}")
                runOnUiThread {
                    connectionStatus.text = "Connection Error"
                }
            }
        }

        private fun sendCommand(command: String) {
            if (webSocketClient?.isOpen == true) {
                val json = JSONObject()
                json.put("command", command)
                webSocketClient?.send(json.toString())
            }
        }

        private fun loadButtonMappings() {
            buttonMappings = mutableMapOf()
            buttonMappings["L1"] = sharedPreferences.getString("L1Command", "L1") ?: "L1"
            buttonMappings["L2"] = sharedPreferences.getString("L2Command", "L2") ?: "L2"
            buttonMappings["R1"] = sharedPreferences.getString("R1Command", "R1") ?: "R1"
            buttonMappings["R2"] = sharedPreferences.getString("R2Command", "R2") ?: "R2"
            buttonMappings["Up"] = sharedPreferences.getString("UpCommand", "DPAD_UP") ?: "DPAD_UP"
            buttonMappings["Left"] = sharedPreferences.getString("LeftCommand", "DPAD_LEFT") ?: "DPAD_LEFT"
            buttonMappings["Right"] = sharedPreferences.getString("RightCommand", "DPAD_RIGHT") ?: "DPAD_RIGHT"
            buttonMappings["Down"] = sharedPreferences.getString("DownCommand", "DPAD_DOWN") ?: "DPAD_DOWN"
            buttonMappings["Y"] = sharedPreferences.getString("YCommand", "BUTTON_Y") ?: "BUTTON_Y"
            buttonMappings["X"] = sharedPreferences.getString("XCommand", "BUTTON_X") ?: "BUTTON_X"
            buttonMappings["B"] = sharedPreferences.getString("BCommand", "BUTTON_B") ?: "BUTTON_B"
            buttonMappings["A"] = sharedPreferences.getString("ACommand", "BUTTON_A") ?: "BUTTON_A"
            buttonMappings["Select"] = sharedPreferences.getString("SelectCommand", "SELECT") ?: "SELECT"
            buttonMappings["Start"] = sharedPreferences.getString("StartCommand", "START") ?: "START"
        }

        private fun getThemeFromPreferences(): Int {
            val theme = sharedPreferences.getString("theme", "light")
            return if (theme == "dark") R.style.Theme_VirtualGamepad_Dark else R.style.Theme_VirtualGamepad_Light
        }

        private fun Double.format(digits: Int) = "%.${digits}f".format(this)
    }
