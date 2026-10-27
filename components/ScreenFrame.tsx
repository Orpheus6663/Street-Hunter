import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { BottomNav } from './navigation';

type ScreenFrameProps = {
  children: ReactNode;
  scroll?: boolean;
  activeTab?: 'inicio' | 'registrar' | 'descobertas';
};

export function ScreenFrame({ children, scroll = true, activeTab }: ScreenFrameProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {scroll ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
      <BottomNav activeTab={activeTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.black },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 22 },
});
