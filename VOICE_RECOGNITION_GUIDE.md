# 🎤 Voice Recognition Integration Guide

## Overview

The Experiences Platform now includes **Google Voice Recognition** using the Web Speech API. Users can dictate experience details naturally, and the system will transcribe their speech in real-time.

## 🌟 Features

### 1. **Real-Time Speech-to-Text**
- Continuous voice recognition
- Live transcript display
- Interim results (shows text as you speak)
- Final results (confirmed text)

### 2. **Browser Support**
- ✅ Chrome / Chromium (full support)
- ✅ Microsoft Edge (full support)
- ✅ Safari (iOS & macOS)
- ⚠️ Firefox (limited support)
- ❌ Older browsers (graceful fallback)

### 3. **Error Handling**
- Microphone permission denied
- No speech detected
- Network errors
- Audio capture failures
- Browser not supported warnings

### 4. **Multi-Language Support**
Ready to support multiple languages:
- English (en-US) - default
- Spanish (es-ES)
- French (fr-FR)
- German (de-DE)
- Portuguese (pt-BR)
- And many more...

## 📦 Components

### `useVoiceRecognition` Hook
Custom React hook that wraps the Web Speech API.

```typescript
const {
  isListening,          // Is currently recording
  transcript,           // Final transcript text
  interimTranscript,    // Live transcript (being spoken)
  startListening,       // Start voice recognition
  stopListening,        // Stop voice recognition
  resetTranscript,      // Clear transcript
  isSupported,          // Browser supports voice recognition
  error                 // Error message (if any)
} = useVoiceRecognition({
  continuous: true,     // Keep listening
  interimResults: true, // Show live text
  language: 'en-US'     // Recognition language
});
```

### `VoiceInput` Component
Standalone voice input component with visual feedback.

**Features:**
- Start/Stop recording button
- Live transcript display
- Visual recording indicator (pulsing red button)
- Error notifications

**Usage:**
```tsx
<VoiceInput
  onTranscriptChange={(text) => console.log('Live:', text)}
  onFinalTranscript={(text) => console.log('Final:', text)}
  language="en-US"
/>
```

### `VoiceInputModal` Component
Full-screen modal for voice experience creation.

**Features:**
- Guided voice input
- Example prompts
- AI processing integration
- Cancel/Submit actions

**Usage:**
```tsx
<VoiceInputModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={(transcript) => processWithAI(transcript)}
/>
```

### `VoiceExperienceCapture` Component (Enhanced)
Integrated into the experience builder with real voice recognition.

**Features:**
- Multi-modal input (voice, file, link)
- Accumulated recordings
- Transcript editing
- File uploads
- Link pasting

## 🚀 Usage in Experience Builder

### Step 1: User Clicks "Voice Input" Button
The voice experience modal opens.

### Step 2: User Starts Speaking
- Click "Start Voice Input" button
- Browser asks for microphone permission (first time only)
- Red pulsing button indicates recording is active
- Live transcript appears as user speaks

### Step 3: User Stops Recording
- Click "Stop Recording" button
- Final transcript is captured
- User can edit transcript if needed

### Step 4: Process with AI
- Click "Process with AI" button
- Transcript is analyzed
- Experience fields are auto-populated:
  - Title
  - Location (city, country)
  - Dates (start, end)
  - Description
  - Agenda items
  - Ticket tiers
  - Category

## 🔐 Permissions

### Microphone Access
The browser will request microphone permission:
- **Granted**: Voice recognition works
- **Denied**: Falls back to text input or file upload

### Best Practices
- Request permission only when user clicks voice button
- Show clear instructions before requesting permission
- Provide alternative input methods
- Handle permission errors gracefully

## 🎯 User Experience Flow

```
1. User clicks "Create with Voice" button
   ↓
2. Modal opens with instructions
   ↓
3. User clicks "Start Voice Input"
   ↓
4. Browser requests microphone permission (if needed)
   ↓
5. User speaks naturally about their experience
   ↓
6. Live transcript appears in real-time
   ↓
7. User clicks "Stop Recording"
   ↓
8. Final transcript is displayed
   ↓
9. User reviews/edits transcript (optional)
   ↓
10. User clicks "Process with AI"
    ↓
11. Experience fields are auto-populated
    ↓
12. User reviews and publishes
```

## 💡 Example Voice Prompts

### Tech Event
> "I'm hosting a hackathon in San Francisco from March 15th to 17th. It's a 3-day event for developers and designers to build innovative apps. We'll have workshops, mentorship sessions, and demo presentations. Early bird tickets are $99 for 50 spots, and regular tickets are $149 for 100 spots."

### Wellness Retreat
> "This is a 7-day yoga and meditation retreat in Bali, Indonesia from June 1st to 7th. Perfect for anyone looking to reconnect with themselves. We'll have morning yoga at 7am, meditation sessions, healthy meals, and free time for beach activities. Standard package is $1299 for 20 people."

### Business Conference
> "I want to create a business leadership summit in New York City next month. It's a 2-day conference with keynote speakers, networking sessions, and workshops. VIP tickets include backstage access for $599. Regular tickets are $399 for 200 attendees."

## 🐛 Troubleshooting

### No Speech Detected
**Cause**: Microphone not working or ambient noise too low
**Solution**: 
- Check microphone settings
- Speak closer to microphone
- Increase microphone volume

### Microphone Permission Denied
**Cause**: User denied permission or browser blocked it
**Solution**:
- Guide user to browser settings
- Show how to enable microphone
- Offer alternative input methods

### Browser Not Supported
**Cause**: Using older browser or Firefox
**Solution**:
- Show warning message
- Recommend Chrome/Edge/Safari
- Hide voice input option
- Provide text/file alternatives

### Network Error
**Cause**: Google Speech API connection failed
**Solution**:
- Check internet connection
- Retry after a few seconds
- Fall back to text input

## 🔧 Technical Details

### Web Speech API
Uses the browser's native Speech Recognition API:
- `SpeechRecognition` (Chrome/Edge)
- `webkitSpeechRecognition` (Safari)

### Recognition Options
```javascript
recognition.continuous = true;      // Keep listening
recognition.interimResults = true;  // Show live text
recognition.lang = 'en-US';         // Language
recognition.maxAlternatives = 1;    // Number of alternatives
```

### Events
- `onstart`: Recognition started
- `onresult`: Speech detected
- `onerror`: Error occurred
- `onend`: Recognition ended

### Data Flow
```
User Speech 
  ↓
Microphone Capture
  ↓
Web Speech API (Google)
  ↓
Interim Results (live)
  ↓
Final Results (confirmed)
  ↓
React State (transcript)
  ↓
UI Display
```

## 📊 Performance

### Latency
- **Interim results**: ~200-500ms
- **Final results**: ~1-2 seconds after user stops speaking

### Accuracy
- **Clear speech**: 95-98% accuracy
- **Noisy environment**: 70-85% accuracy
- **Accent handling**: Generally good, varies by accent

### Data Usage
- Minimal data usage
- Only audio data is sent to Google
- No user data is stored

## 🔒 Privacy & Security

### Data Handling
- Audio is processed by Google's Speech API
- Transcripts are stored locally in React state
- No audio is stored on servers
- No transcripts are sent to third parties

### User Consent
- Microphone permission required
- Clear privacy notice in modal
- User can cancel at any time

## 🎨 Customization

### Change Language
```typescript
<VoiceInput language="es-ES" />  // Spanish
<VoiceInput language="fr-FR" />  // French
<VoiceInput language="de-DE" />  // German
```

### Styling
All components use Tailwind CSS and can be customized:
```tsx
<VoiceInput className="custom-voice-input" />
```

### Events
```tsx
<VoiceInput
  onTranscriptChange={(text) => {
    // Update live preview
  }}
  onFinalTranscript={(text) => {
    // Process final text
  }}
/>
```

## ✅ Testing Checklist

- [ ] Voice recognition starts when button clicked
- [ ] Live transcript appears as user speaks
- [ ] Final transcript captured when recording stops
- [ ] Error messages display correctly
- [ ] Browser permission request works
- [ ] Fallback to mock data if no speech detected
- [ ] Works on Chrome/Edge
- [ ] Works on Safari (iOS & macOS)
- [ ] Graceful degradation on unsupported browsers
- [ ] Microphone permission denied handled
- [ ] Network errors handled

## 🚦 Browser Compatibility Matrix

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 25+ | ✅ Full Support | Best performance |
| Edge | 79+ | ✅ Full Support | Chromium-based |
| Safari | 14.1+ | ✅ Full Support | iOS & macOS |
| Firefox | Any | ⚠️ Limited | No Web Speech API |
| Opera | 27+ | ✅ Full Support | Chromium-based |
| IE | Any | ❌ Not Supported | Use polyfill or fallback |

## 📚 Resources

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Browser Compatibility Table](https://caniuse.com/speech-recognition)
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text)

## 🎉 Features Coming Soon

- [ ] Multi-language auto-detection
- [ ] Voice commands ("add ticket", "set date", etc.)
- [ ] Offline speech recognition (experimental)
- [ ] Custom vocabulary for domain-specific terms
- [ ] Voice cloning for experience previews
- [ ] Emotion detection from voice tone

---

**Built with ❤️ using Web Speech API and React**

