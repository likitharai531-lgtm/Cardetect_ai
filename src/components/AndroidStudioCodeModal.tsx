import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Smartphone, BookOpen, Layers, Terminal } from 'lucide-react';

interface AndroidStudioCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KOTLIN_MAIN_ACTIVITY = `package com.example.cardetectai

import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    private val viewModel: CarDetectViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CarDetectAiTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CarDetectApp(viewModel)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CarDetectApp(viewModel: CarDetectViewModel) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    var selectedBitmap by remember { mutableStateOf<Bitmap?>(null) }

    // Camera launcher (captures thumbnail bitmap directly)
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            selectedBitmap = bitmap
            viewModel.resetDetection()
        }
    }

    // Gallery launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            val bitmap = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                ImageDecoder.decodeBitmap(ImageDecoder.createSource(context.contentResolver, uri))
            } else {
                @Suppress("DEPRECATION")
                MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
            }
            selectedBitmap = bitmap
            viewModel.resetDetection()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "CarDetect AI",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 1. IMAGE PREVIEW SECTION
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    if (selectedBitmap != null) {
                        Image(
                            bitmap = selectedBitmap!!.asImageBitmap(),
                            contentDescription = "Car Preview",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                            modifier = Modifier.padding(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AddPhotoAlternate,
                                contentDescription = null,
                                modifier = Modifier.size(56.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Take a photo or pick an image",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 2. CAMERA AND GALLERY BUTTONS
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = { cameraLauncher.launch(null) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.CameraAlt, contentDescription = "Camera")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Camera")
                }

                OutlinedButton(
                    onClick = { galleryLauncher.launch("image/*") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.PhotoLibrary, contentDescription = "Gallery")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Gallery")
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 3. DETECT CAR BUTTON
            Button(
                onClick = {
                    selectedBitmap?.let { viewModel.detectCar(it) }
                },
                enabled = selectedBitmap != null && uiState !is DetectionState.Loading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Detect Car",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 4. LOADING INDICATOR
            if (uiState is DetectionState.Loading) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(42.dp),
                        strokeWidth = 4.dp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Analyzing photo with Gemini Vision AI...",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // 5. ERROR STATE
            if (uiState is DetectionState.Error) {
                val errorMsg = (uiState as DetectionState.Error).message
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.ErrorOutline,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = errorMsg,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }
            }

            // 6. RESULTS SECTION
            if (uiState is DetectionState.Success) {
                val result = (uiState as DetectionState.Success).result

                if (result.isCarDetected) {
                    Text(
                        text = "CAR DETECTION RESULTS",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    // Result Card 1: MAKE
                    CarResultCard(
                        title = "Make / Brand",
                        value = result.make,
                        icon = Icons.Default.DirectionsCar,
                        color = Color(0xFF2563EB)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Result Card 2: MODEL
                    CarResultCard(
                        title = "Model",
                        value = result.model,
                        icon = Icons.Default.DriveEta,
                        color = Color(0xFF7C3AED)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Result Card 3: COLOUR
                    CarResultCard(
                        title = "Colour",
                        value = result.colour,
                        icon = Icons.Default.Palette,
                        color = Color(0xFF059669)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // 7. TRY ANOTHER IMAGE BUTTON
                    FilledTonalButton(
                        onClick = {
                            selectedBitmap = null
                            viewModel.resetDetection()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Try Another Image")
                    }
                } else {
                    // NO CAR DETECTED STATE
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        ),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.HighlightOff,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(52.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No car detected",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Please ensure the vehicle is clearly visible in good lighting and try again.",
                                textAlign = TextAlign.Center,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = {
                                    selectedBitmap = null
                                    viewModel.resetDetection()
                                },
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("Try Another Image")
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CarResultCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    text = title.uppercase(),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = if (value.isNotBlank()) value else "Unknown",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}
`;

const KOTLIN_VIEWMODEL = `package com.example.cardetectai

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONObject

data class CarDetectionResult(
    val isCarDetected: Boolean,
    val make: String,
    val model: String,
    val colour: String,
    val notes: String = ""
)

sealed class DetectionState {
    object Idle : DetectionState()
    object Loading : DetectionState()
    data class Success(val result: CarDetectionResult) : DetectionState()
    data class Error(val message: String) : DetectionState()
}

class CarDetectViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<DetectionState>(DetectionState.Idle)
    val uiState: StateFlow<DetectionState> = _uiState.asStateFlow()

    // Replace with your API key or configure through local.properties / BuildConfig
    private val generativeModel = GenerativeModel(
        modelName = "gemini-1.5-flash", // or gemini-2.0-flash / gemini-3.8-flash
        apiKey = BuildConfig.GEMINI_API_KEY
    )

    fun resetDetection() {
        _uiState.value = DetectionState.Idle
    }

    fun detectCar(bitmap: Bitmap) {
        viewModelScope.launch {
            _uiState.value = DetectionState.Loading

            try {
                val prompt = """
                    Analyze this image to detect if it contains a car.
                    Respond ONLY with valid JSON in this exact structure:
                    {
                      "isCarDetected": true,
                      "make": "Toyota",
                      "model": "Camry",
                      "colour": "Silver Metallic",
                      "notes": "Midsize family sedan"
                    }
                    If no car is present, return:
                    {
                      "isCarDetected": false,
                      "make": "",
                      "model": "",
                      "colour": "",
                      "notes": "No car found"
                    }
                """.trimIndent()

                val inputContent = content {
                    image(bitmap)
                    text(prompt)
                }

                val response = generativeModel.generateContent(inputContent)
                val responseText = response.text ?: throw Exception("Empty response from AI")

                // Extract JSON if wrapped in markdown code fence
                val cleanJson = responseText
                    .replace("\`\`\`json", "")
                    .replace("\`\`\`", "")
                    .trim()

                val json = JSONObject(cleanJson)
                val result = CarDetectionResult(
                    isCarDetected = json.optBoolean("isCarDetected", false),
                    make = json.optString("make", ""),
                    model = json.optString("model", ""),
                    colour = json.optString("colour", ""),
                    notes = json.optString("notes", "")
                )

                _uiState.value = DetectionState.Success(result)
            } catch (e: Exception) {
                _uiState.value = DetectionState.Error(
                    e.localizedMessage ?: "Failed to analyze image. Please check your network connection."
                )
            }
        }
    }
}
`;

const ANDROID_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.cardetectai">

    <!-- Permissions for Camera and Internet -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- Optional feature flag: app can still run on devices without hardware camera -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="CarDetect AI"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CarDetectAI">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.CarDetectAI">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`;

const BUILD_GRADLE = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.cardetectai"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.cardetectai"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Inject API Key from local.properties
        buildConfigField("String", "GEMINI_API_KEY", "\"YOUR_GEMINI_API_KEY\"")
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    // Jetpack Compose
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.activity.compose)
    implementation("androidx.compose.material:material-icons-extended")

    // ViewModel & Lifecycle
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")

    // Google Generative AI Client SDK for Android
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")

    // Image loading
    implementation("io.coil-kt:coil-compose:2.7.0")
}
`;

export const AndroidStudioCodeModal: React.FC<AndroidStudioCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'viewmodel' | 'manifest' | 'gradle' | 'instructions'>('main');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getCode = () => {
    switch (activeTab) {
      case 'main':
        return KOTLIN_MAIN_ACTIVITY;
      case 'viewmodel':
        return KOTLIN_VIEWMODEL;
      case 'manifest':
        return ANDROID_MANIFEST;
      case 'gradle':
        return BUILD_GRADLE;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                CarDetect AI • Android Studio Kotlin Project
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  Ready to Build
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Jetpack Compose + Google Generative AI Android SDK architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1.5 px-4 pt-2.5 bg-slate-950/40 border-b border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('main')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'main'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            MainActivity.kt (UI)
          </button>

          <button
            onClick={() => setActiveTab('viewmodel')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'viewmodel'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            CarDetectViewModel.kt (AI)
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'manifest'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            AndroidManifest.xml
          </button>

          <button
            onClick={() => setActiveTab('gradle')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'gradle'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            build.gradle.kts
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'instructions'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Beginner Setup Guide
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs sm:text-sm text-slate-300">
          {activeTab === 'instructions' ? (
            <div className="font-sans text-sm text-slate-200 space-y-4 max-w-2xl py-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                How to Run CarDetect AI in Android Studio
              </h3>

              <ol className="list-decimal pl-5 space-y-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
                <li>
                  <strong className="text-white">Create a New Android Project:</strong> Open{' '}
                  <span className="text-emerald-400 font-mono">Android Studio Hedgehog or Ladybug</span>, click{' '}
                  <em>New Project</em>, and select <strong>Empty Activity (Compose)</strong>.
                </li>
                <li>
                  <strong className="text-white">Name the Application:</strong> Set name to{' '}
                  <span className="text-emerald-400 font-mono">CarDetect AI</span> and package name to{' '}
                  <span className="text-slate-400 font-mono">com.example.cardetectai</span>.
                </li>
                <li>
                  <strong className="text-white">Add Dependencies:</strong> Copy the code from the{' '}
                  <span className="text-emerald-400">build.gradle.kts</span> tab into your app-level{' '}
                  <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">build.gradle.kts</code> file and click{' '}
                  <strong>Sync Now</strong>.
                </li>
                <li>
                  <strong className="text-white">Update AndroidManifest.xml:</strong> Copy the permissions from the{' '}
                  <span className="text-emerald-400">AndroidManifest.xml</span> tab to allow Camera and Internet access.
                </li>
                <li>
                  <strong className="text-white">Copy Kotlin Code:</strong> Paste{' '}
                  <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">MainActivity.kt</code> and{' '}
                  <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">CarDetectViewModel.kt</code> into your source folder.
                </li>
                <li>
                  <strong className="text-white">Run the App:</strong> Connect an Android phone or launch the Android Emulator and click{' '}
                  <strong className="text-emerald-400">Run (Shift + F10)</strong>!
                </li>
              </ol>

              <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl text-xs text-emerald-200">
                💡 <strong>Tip:</strong> You can also test all features (camera, gallery, AI detection, result cards, and error handling) live right here in your web browser!
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="overflow-x-auto whitespace-pre leading-relaxed select-text">
                <code>{getCode()}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer toolbar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {activeTab === 'instructions'
              ? 'Beginner-friendly step-by-step setup'
              : 'Target SDK: Android 35 • Kotlin 2.0 • Jetpack Compose'}
          </span>
          {activeTab !== 'instructions' && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
