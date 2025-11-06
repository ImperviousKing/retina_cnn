import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wifi, WifiOff, CloudOff } from 'lucide-react-native';
import { useOffline } from '@/contexts/offline-context';
import Colors from '@/constants/colors';

export default function OfflineIndicator() {
  const { isOnline, getPendingSyncCount, syncPendingData } = useOffline();
  const pendingCount = getPendingSyncCount();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!isOnline ? (
        <View style={[styles.badge, styles.offlineBadge]}>
          <WifiOff size={16} color={Colors.text.primary} strokeWidth={2.5} />
          <Text style={styles.badgeText}>Offline Mode</Text>
          <CloudOff size={14} color={Colors.text.primary} strokeWidth={2} />
        </View>
      ) : pendingCount > 0 ? (
        <TouchableOpacity 
          style={[styles.badge, styles.syncBadge]}
          onPress={() => syncPendingData()}
          activeOpacity={0.7}
        >
          <Wifi size={16} color={Colors.text.primary} strokeWidth={2.5} />
          <Text style={styles.badgeText}>
            {pendingCount} pending sync
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 2,
  },
  offlineBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  syncBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
});
