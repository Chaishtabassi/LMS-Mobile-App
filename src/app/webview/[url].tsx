import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f9fafb;
          color: #111827;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2563eb;
          margin-bottom: 16px;
        }
        .content {
          line-height: 1.6;
        }
        .video-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          margin-bottom: 20px;
        }
        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }
        button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
        }
        button:hover {
          background: #1d4ed8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title || 'Course Content'}</h1>
        <div class="content">
          <p>Welcome to this comprehensive course! Here's what you'll learn:</p>
          <ul>
            <li>Fundamental concepts and best practices</li>
            <li>Hands-on exercises and real-world examples</li>
            <li>Advanced techniques and optimization</li>
          </ul>
          <div class="video-container">
            <iframe 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
          <p>Complete all sections and quizzes to earn your certificate. Good luck with your learning journey!</p>
          <button onclick="window.ReactNativeWebView.postMessage('completed')">
            Mark as Complete
          </button>
        </div>
      </div>
      <script>
        window.addEventListener('message', (event) => {
          if (event.data === 'getProgress') {
            const progress = localStorage.getItem('courseProgress') || '0';
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'progress', value: progress }));
          }
        });
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    const data = event.nativeEvent.data;
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'progress') {
        console.log('Course progress:', parsed.value);
      }
    } catch {
      if (data === 'completed') {
        console.log('Course marked as completed');
      }
    }
  };

  const handleReload = () => {
    setError(false);
    setLoading(true);
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-red-600 text-lg mb-4">Failed to load content</Text>
          <Text className="text-gray-600 text-center mb-6">
            Please check your internet connection and try again
          </Text>
          <TouchableOpacity
            onPress={handleReload}
            className="bg-primary-600 px-6 py-3 rounded-lg flex-row items-center"
          >
            <RefreshCw size={20} color="white" />
            <Text className="text-white ml-2 font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 flex-1">
          {title || 'Course Content'}
        </Text>
      </View>
      
      <WebView
        source={{ html: htmlContent }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}
        injectedJavaScript={`
          const token = window.ReactNativeWebView.token;
          if (token) {
            localStorage.setItem('authToken', token);
          }
          true;
        `}
      />
    </SafeAreaView>
  );
}