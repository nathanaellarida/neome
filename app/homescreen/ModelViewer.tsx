import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export default function ModelViewer() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [avatarModel, setAvatarModel] = useState('femaleBody6.glb'); // Default middle avatar
  const [avatarScale, setAvatarScale] = useState(1); // Default scale

  // Function to calculate BMI and return appropriate avatar
  const calculateBMIAndSetAvatar = () => {
    if (!height || !weight) return;
    
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    
    // Avatar selection based on BMI
    let newAvatar = '';
    if (bmi < 16) newAvatar = 'femaleBody1.glb';
    else if (bmi < 17) newAvatar = 'femaleBody2.glb';
    else if (bmi < 18.5) newAvatar = 'femaleBody3.glb';
    else if (bmi < 20) newAvatar = 'femaleBody4.glb';
    else if (bmi < 22) newAvatar = 'femaleBody5.glb';
    else if (bmi < 24) newAvatar = 'femaleBody6.glb';
    else if (bmi < 28) newAvatar = 'femaleBody7.glb';
    else if (bmi < 30) newAvatar = 'femaleBody8.glb';
    else if (bmi < 32) newAvatar = 'femaleBody9.glb';
    else if (bmi < 35) newAvatar = 'femaleBody10.glb';
    else newAvatar = 'femaleBody11.glb';
    
    // Calculate avatar scale based on height (reference height of 160cm)
    const newScale = parseFloat(height) / 160;
    
    setAvatarModel(newAvatar);
    setAvatarScale(newScale);
  };

  // Create HTML content to be injected into WebView
  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow: hidden;
              background-color: #fff;
              font-family: Arial, sans-serif;
            }
            model-viewer {
              width: 100%;
              height: 100%;
            }
            .stats {
              position: absolute;
              bottom: 10px;
              left: 10px;
              background-color: rgba(255, 255, 255, 0.7);
              padding: 5px 10px;
              border-radius: 5px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <model-viewer 
            id="avatar-model"
            src="https://raw.githubusercontent.com/VIRGINIAMW123/female-avatar-models/main/${avatarModel}"
            alt="3D Avatar"
            auto-rotate
            camera-controls
            environment-image="neutral"
            shadow-intensity="1"
            exposure="1"
            autoplay
            camera-orbit="0deg 90deg 2.5m"
            min-camera-orbit="auto auto 1.5m"
            max-camera-orbit="auto auto 4m">
            <div class="stats">
              Height: ${height} cm | Weight: ${weight} kg
            </div>
          </model-viewer>
          <script>
            // Apply avatar scaling based on height
            const modelViewer = document.querySelector('model-viewer');
            
            // Wait for the model to load before applying scaling and loading animations
            modelViewer.addEventListener('load', () => {
              // Apply scale to the model
              const scale = ${avatarScale};
              modelViewer.scale = \`\${scale} \${scale} \${scale}\`;
              
              // Adjust camera position based on height to ensure avatar is properly framed
              const orbitHeight = 1.2 + (${parseFloat(height) > 160 ? 0.2 : 0}); // Adjust camera height for taller avatars
              modelViewer.cameraOrbit = \`0deg \${orbitHeight}m 2.5m\`;
              
              // Auto-play first animation if available
              if (modelViewer.availableAnimations && modelViewer.availableAnimations.length > 0) {
                modelViewer.animationName = modelViewer.availableAnimations[0];
                modelViewer.play();
              }
            });
          </script>
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <Button
          title="Generate Avatar"
          onPress={calculateBMIAndSetAvatar}
        />
      </View>
      <View style={styles.webviewContainer}>
        <WebView
          originWhitelist={['https://*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          source={{ html: generateHTML() }}
          style={styles.webview}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});