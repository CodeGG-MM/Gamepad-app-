
    ```kotlin
    package com.example.virtualgamepad

    import android.content.Context
    import android.content.SharedPreferences
    import android.os.Bundle
    import android.widget.Button
    import android.widget.EditText
    import android.widget.RadioButton
    import android.widget.RadioGroup
    import androidx.appcompat.app.AppCompatActivity

    class SettingsActivity : AppCompatActivity() {

        private lateinit var serverAddressInput: EditText
        private lateinit var l1CommandInput: EditText
        private lateinit var l2CommandInput: EditText
        private lateinit var r1CommandInput: EditText
        private lateinit var r2CommandInput: EditText
        private lateinit var