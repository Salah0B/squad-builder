import { Player } from '@/types/Player';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FIELD_WIDTH = SCREEN_WIDTH - 32;
const FIELD_HEIGHT = FIELD_WIDTH * 1.5;

export default function Squad() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState('33');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPlayersFromApi ();
  }, []);

  const loadPlayersFromApi = async () => {
    try {
      const playersData = require('./players.json');
      setPlayers(playersData);
    } catch (error) {
      console.error('Error loading players:', error);
      setPlayers([
        { id: 1, name: 'Player 1', position: 'GK', number: 1, age: 0, nationality: 'Unknown', x: 50, y: 85 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createPanResponder = (player: Player) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Touch started
      },
      onPanResponderMove: (evt, gestureState) => {
        const newX = ((player.x * FIELD_WIDTH / 100) + gestureState.dx) / FIELD_WIDTH * 100;
        const newY = ((player.y * FIELD_HEIGHT / 100) + gestureState.dy) / FIELD_HEIGHT * 100;

        setPlayers(prev => prev.map(p => 
          p.id === player.id 
            ? { ...p, x: Math.max(5, Math.min(95, newX)), y: Math.max(5, Math.min(95, newY)) }
            : p
        ));
      },
      onPanResponderRelease: () => {
        // Touch ended
      },
    });
  };

  const handlePlayerPress = (player: Player) => {
    setSelectedPlayer(player);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Squad Builder</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading players...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.fieldContainer}>
          <View style={[styles.field, { width: FIELD_WIDTH, height: FIELD_HEIGHT }]}>
            {/* Field markings */}
            <View style={styles.halfwayLine} />
            <View style={styles.centerCircle} />
            <View style={styles.topPenaltyBox} />
            <View style={styles.topGoalBox} />
            <View style={styles.bottomPenaltyBox} />
            <View style={styles.bottomGoalBox} />

            {/* Players */}
            {players.map(player => {
              const panResponder = createPanResponder(player);
              return (
                <View
                  key={player.id}
                  {...panResponder.panHandlers}
                  style={[
                    styles.playerContainer,
                    {
                      left: (player.x * FIELD_WIDTH / 100) - 28,
                      top: (player.y * FIELD_HEIGHT / 100) - 28,
                    }
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handlePlayerPress(player)}
                    style={styles.playerTouchable}
                  >
                    <View style={styles.playerCircle}>
                      <Text style={styles.playerNumber}>{player.number}</Text>
                    </View>
                    <View style={styles.playerNameBadge}>
                      <Text style={styles.playerName}>{player.name}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <Text style={styles.instruction}>
            Drag players to reposition • Tap to view details
          </Text>
        </View>
      </ScrollView>
      )}

      {/* Player Info Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPlayer && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Player Info</Text>
                  <TouchableOpacity
                    onPress={() => setShowModal(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.playerInfoSection}>
                  <View style={styles.playerCircleLarge}>
                    <Text style={styles.playerNumberLarge}>{selectedPlayer.number}</Text>
                  </View>
                  <Text style={styles.playerNameLarge}>{selectedPlayer.name}</Text>
                  <Text style={styles.playerPositionLarge}>{selectedPlayer.position}</Text>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Number</Text>
                    <Text style={styles.statValue}>{selectedPlayer.number}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Position</Text>
                    <Text style={styles.statValue}>{selectedPlayer.position}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Age</Text>
                    <Text style={styles.statValue}>{selectedPlayer.age} years</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Nationality</Text>
                    <Text style={styles.statValue}>{selectedPlayer.nationality}</Text>
                  </View>
                </View>

                <View style={styles.hint}>
                  <Text style={styles.hintText}>
                    Substitute
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#065f46',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  fieldContainer: {
    alignItems: 'center',
  },
  field: {
    backgroundColor: '#059669',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  halfwayLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fff',
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    marginLeft: -40,
    marginTop: -40,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
  },
  topPenaltyBox: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 120,
    height: 50,
    marginLeft: -60,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#fff',
  },
  topGoalBox: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 60,
    height: 30,
    marginLeft: -30,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#fff',
  },
  bottomPenaltyBox: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 120,
    height: 50,
    marginLeft: -60,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#fff',
  },
  bottomGoalBox: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 60,
    height: 30,
    marginLeft: -30,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#fff',
  },
  playerContainer: {
    position: 'absolute',
    width: 56,
    height: 56,
  },
  playerTouchable: {
    alignItems: 'center',
  },
  playerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playerNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerNameBadge: {
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playerName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  instruction: {
    color: '#fff',
    fontSize: 12,
    marginTop: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  playerInfoSection: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  playerCircleLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  playerNumberLarge: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  playerNameLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  playerPositionLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  statsContainer: {
    marginTop: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  hint: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
});