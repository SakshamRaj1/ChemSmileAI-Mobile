import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const WEBSITE_URL = 'https://doornail-plant-jazz.ngrok-free.dev/'; 
const APP_TITLE = 'ChemSmileAI';
const APP_DESCRIPTION = 'Molecular Analysis and Similarity Search Engine';
const APP_SUBTITLE =
  'Computational cheminformatics platform designed for code-free chemical analysis, molecular property computation, and structural modification workflows.';
const SPLASH_DURATION_MS = 2500;

// Auto-click "Visit Site" fallback if ngrok shows the HTML interstitial page
const INJECTED_JAVASCRIPT = `
  (function() {
    function bypassNgrok() {
      var buttons = Array.from(document.querySelectorAll('button, a'));
      for (var el of buttons) {
        if (el.textContent && el.textContent.trim().toLowerCase().includes('visit site')) {
          el.click();
          break;
        }
      }
    }
    bypassNgrok();
    setTimeout(bypassNgrok, 300);
    setTimeout(bypassNgrok, 1000);
  })();
  true;
`;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef(null);

  // Transition from the splash/intro screen to the web app
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  // Handle hardware back button on Android (navigates back inside WebView)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  // Initial Welcome / Splash Interface
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0909" />
        
        <View style={styles.splashTextContainer}>
          <Text style={styles.splashTitle}>{APP_TITLE}</Text>
          <Text style={styles.splashDescription}>{APP_DESCRIPTION}</Text>
          <Text style={styles.splashSubtitle}>{APP_SUBTITLE}</Text>
        </View>

        <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0909" />

        {hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Connection Failed</Text>
            <Text style={styles.errorSubtitle}>
              Could not connect to the server. Please check your internet connection.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setHasError(false);
                webViewRef.current?.reload();
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{
              uri: WEBSITE_URL,
              // Skip ngrok browser warning screen
              headers: {
                'ngrok-skip-browser-warning': 'true',
              },
            }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            renderLoading={() => (
              <View style={styles.webviewLoaderContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            )}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            onError={() => setHasError(true)}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              if (nativeEvent.statusCode >= 400) {
                setHasError(true);
              }
            }}
            allowsInlineMediaPlayback={true}
            mixedContentMode="compatibility"
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0909',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0b0909',
  },
  webviewLoaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b0909',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0b0909',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  splashTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F9FAFB',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  splashDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#93C5FD',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 14,
  },
  splashSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  loader: {
    marginTop: 32,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#0b0909',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});