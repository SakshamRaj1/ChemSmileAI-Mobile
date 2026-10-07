import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const WEBSITE_URL = 'https://doornail-plant-jazz.ngrok-free.dev/'; 
const APP_TITLE = 'ChemSmileAI';
const APP_DESCRIPTION = 'Molecular Analysis and Similarity Search Engine';
const APP_SUBTITLE =
  'Computational cheminformatics platform designed for code-free chemical analysis, molecular property computation, and structural modification workflows.';
const SPLASH_DURATION_MS = 2000;

const INJECTED_FLASK_INTERCEPTOR = `
  (function() {
    // 1. Bypass ngrok interstitial
    function bypassNgrok() {
      var buttons = Array.from(document.querySelectorAll('button, a'));
      for (var el of buttons) {
        if (el.textContent && el.textContent.trim().toLowerCase().includes('visit site')) {
          el.click();
          break;
        }
      }
    }
    document.addEventListener('DOMContentLoaded', bypassNgrok);
    setTimeout(bypassNgrok, 300);

    // 2. Track the exact button that was clicked to submit the form
    var lastClickedSubmitBtn = null;
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('button, input[type="submit"]');
      if (btn) {
        lastClickedSubmitBtn = btn;
      }
    }, true);

    // 3. Resolve URLs safely
    function resolveUrl(rawUrl) {
      try {
        return new URL(rawUrl, window.location.origin).href;
      } catch (e) {
        return window.location.href;
      }
    }

    // 4. Intercept Form Submissions
    async function handleFlaskForm(form, clickedButton) {
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DOWNLOAD_START' }));
        
        var rawAction = form.getAttribute('action') || '';
        var actionUrl = resolveUrl(rawAction);
        
        // Cache buster parameter
        var separator = actionUrl.includes('?') ? '&' : '?';
        var cacheBustedUrl = actionUrl + separator + '_nocache=' + Date.now();

        var method = (form.getAttribute('method') || form.method || 'POST').toUpperCase();
        var formData = new FormData(form);

        // CRITICAL: Append the specific clicked button's name & value so Flask knows the exact format (e.g. format=sdf)
        if (clickedButton && clickedButton.name) {
          formData.append(clickedButton.name, clickedButton.value || '');
        }

        var response = await fetch(cacheBustedUrl, {
          method: method,
          body: method === 'POST' ? formData : null,
          cache: 'no-store',
          headers: { 
            'ngrok-skip-browser-warning': 'true',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        // Detect filename from Content-Disposition
        var disposition = response.headers.get('Content-Disposition') || '';
        var filename = '';
        var filenameMatch = disposition.match(/filename[^;=\\n]*=((['"]).*?\\2|[^;\\n]*)/);
        
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        } else {
          // Fallback extension based on Content-Type header
          var contentType = response.headers.get('Content-Type') || '';
          var ext = '.txt';
          if (contentType.includes('csv')) ext = '.csv';
          else if (contentType.includes('image/png') || contentType.includes('png')) ext = '.png';
          else if (contentType.includes('sdf') || contentType.includes('chemical/x-mdl-sdfile')) ext = '.sdf';
          else if (contentType.includes('mol')) ext = '.mol';
          else if (contentType.includes('json')) ext = '.json';
          
          filename = 'chemsmile_' + Date.now() + ext;
        }

        var blob = await response.blob();
        var reader = new FileReader();
        reader.onloadend = function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'DOWNLOAD_SUCCESS',
            data: reader.result.split(',')[1],
            filename: filename
          }));
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'DOWNLOAD_ERROR',
          error: err.toString()
        }));
      }
    }

    var originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      var rawAction = (this.getAttribute('action') || '').toLowerCase();
      if (rawAction.includes('download') || rawAction.includes('export')) {
        handleFlaskForm(this, lastClickedSubmitBtn);
        return;
      }
      return originalSubmit.apply(this, arguments);
    };

    document.addEventListener('submit', function(e) {
      var form = e.target;
      var rawAction = (form.getAttribute('action') || '').toLowerCase();
      if (rawAction.includes('download') || rawAction.includes('export')) {
        e.preventDefault();
        e.stopPropagation();
        handleFlaskForm(form, lastClickedSubmitBtn);
      }
    }, true);

    // 5. Intercept anchor tag downloads (direct URLs)
    document.addEventListener('click', function(e) {
      var a = e.target.closest('a');
      if (a && a.href) {
        var href = a.href.toLowerCase();
        if (href.includes('download') || href.includes('export') || /\\.(csv|sdf|mol|pdb|png|jpg|txt)($|\\?)/i.test(href)) {
          e.preventDefault();
          e.stopPropagation();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'TRIGGER_URL_DOWNLOAD',
            url: a.href,
            filename: a.getAttribute('download') || ''
          }));
        }
      }
    }, true);
  })();
  true;
`;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  const saveBase64File = async (base64Data, filename) => {
    try {
      setDownloading(true);
      
      const safeName = filename || `chemsmile_export_${Date.now()}`;
      const fileUri = `${FileSystem.cacheDirectory}${safeName}`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setDownloading(false);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: `Save ${safeName}`,
          mimeType: 'application/octet-stream',
        });
      } else {
        Alert.alert('Download Complete', `File saved to ${fileUri}`);
      }
    } catch (err) {
      setDownloading(false);
      Alert.alert('Save Error', err.message);
    }
  };

  const downloadFromUrl = async (url, suggestedName = '') => {
    try {
      setDownloading(true);
      let safeName = suggestedName || url.split('/').pop().split('?')[0] || `chemsmile_${Date.now()}`;

      const fileUri = `${FileSystem.cacheDirectory}${safeName}`;
      const result = await FileSystem.downloadAsync(url, fileUri, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      setDownloading(false);

      if (result.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            dialogTitle: `Save ${safeName}`,
            mimeType: 'application/octet-stream',
          });
        } else {
          Alert.alert('Download Complete', `Saved to ${fileUri}`);
        }
      } else {
        Alert.alert('Download Error', `Server returned status ${result.status}`);
      }
    } catch (err) {
      setDownloading(false);
      Alert.alert('Download Error', err.message);
    }
  };

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'DOWNLOAD_START') {
        setDownloading(true);
      } else if (msg.type === 'DOWNLOAD_SUCCESS') {
        saveBase64File(msg.data, msg.filename);
      } else if (msg.type === 'TRIGGER_URL_DOWNLOAD') {
        downloadFromUrl(msg.url, msg.filename);
      } else if (msg.type === 'DOWNLOAD_ERROR') {
        setDownloading(false);
        Alert.alert('Download Failed', msg.error);
      }
    } catch {
      // Ignore
    }
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0909" />
        <View style={styles.splashTextContainer}>
          <Text style={styles.splashTitle}>{APP_TITLE}</Text>
          <Text style={styles.splashDescription}>{APP_DESCRIPTION}</Text>
          <Text style={styles.splashSubtitle}>{APP_SUBTITLE}</Text>
        </View>
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0909" />

        {downloading && (
          <View style={styles.downloadOverlay}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.downloadText}>Processing download...</Text>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{
            uri: WEBSITE_URL,
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          injectedJavaScriptBeforeContentLoaded={INJECTED_FLASK_INTERCEPTOR}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url.toLowerCase();
            const isDownloadRoute =
              url.includes('/download') ||
              url.includes('/export') ||
              url.endsWith('.csv') ||
              url.endsWith('.sdf') ||
              url.endsWith('.mol') ||
              url.endsWith('.pdb') ||
              url.endsWith('.png');

            if (isDownloadRoute && request.url !== WEBSITE_URL) {
              downloadFromUrl(request.url);
              return false;
            }
            return true;
          }}
          onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
          allowsInlineMediaPlayback={true}
          mixedContentMode="compatibility"
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0909' },
  webview: { flex: 1, backgroundColor: '#0b0909' },
  downloadOverlay: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 8,
  },
  downloadText: { color: '#F9FAFB', marginLeft: 10, fontSize: 14, fontWeight: '500' },
  splashContainer: { flex: 1, backgroundColor: '#0b0909', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  splashTextContainer: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  splashTitle: { fontSize: 32, fontWeight: '700', color: '#F9FAFB', letterSpacing: 0.5, textAlign: 'center', marginBottom: 10 },
  splashDescription: { fontSize: 16, fontWeight: '500', color: '#93C5FD', textAlign: 'center', lineHeight: 22, marginBottom: 14 },
  splashSubtitle: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 19, paddingHorizontal: 12 },
});

