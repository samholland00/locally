import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Signup() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!firstName.trim() || !lastName.trim() || !displayName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            display_name: displayName.trim(),
          },
        },
      });
      if (error) throw error;
      router.push('/(auth)/address');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not create account. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>create account</Text>
        <Text style={styles.sectionLabel}>your real name — private, never shown publicly</Text>
        <TextInput
          style={styles.input}
          placeholder="first name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="last name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <Text style={styles.sectionLabel}>what neighbors see in the feed</Text>
        <TextInput
          style={styles.input}
          placeholder="display name"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <Text style={styles.sectionLabel}>account credentials</Text>
        <TextInput
          style={styles.input}
          placeholder="email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={submit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'creating account...' : 'continue'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.link}>
          <Text style={styles.linkText}>already have an account? <Text style={styles.linkUnderline}>sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { justifyContent: 'center', padding: 24, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 32 },
  sectionLabel: { fontSize: 12, color: '#888', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 12, fontSize: 16, marginBottom: 12 },
  button: { backgroundColor: '#000', paddingVertical: 14, borderRadius: 4, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#666' },
  linkUnderline: { textDecorationLine: 'underline' },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, color: '#000' },
});
