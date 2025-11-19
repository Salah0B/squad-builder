import { Player } from '@/types/Player';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { mapApiPlayersToAppPlayers } from '../../config/playerMapper';
import { fetchTeamSquad } from '../../services/fetchPlayers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FIELD_WIDTH = SCREEN_WIDTH - 32;
const FIELD_HEIGHT = FIELD_WIDTH * 1.5;

const DEFAULT_TEAM_ID = '33';

export default function FootballSquad() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    loadPlayersFromApi();
  }, []);

  const loadPlayersFromApi = async () => {
    setLoading(true);
    try {
      const data = await fetchTeamSquad(DEFAULT_TEAM_ID);
      if (data.response && data.response.length > 0) {
        const teamData = data.response[0];
        setTeamName(teamData.team.name);
        
        const mappedPlayers = mapApiPlayersToAppPlayers(teamData.players);
        const starters = mappedPlayers.filter(p => p.isStarter);
        const bench = mappedPlayers.filter(p => !p.isStarter);
        
        setPlayers(starters);
        setBenchPlayers(bench);
        setAllPlayers(mappedPlayers);
      } else {
        Alert.alert('Error', 'No squad data found for team ' + DEFAULT_TEAM_ID);
      }
    } catch (error) {
      console.error('Error loading players from API:', error);
      Alert.alert(
        'Error',
        'Failed to load team squad. Please check your API key and internet connection.'
      );
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
    setShowSubstitutes(false);
  };

  const handleSubstitute = (benchPlayer: Player) => {
    if (!selectedPlayer) return;

    const oldPlayerX = selectedPlayer.x;
    const oldPlayerY = selectedPlayer.y;

    const updatedStarters = players.map(p => 
      p.id === selectedPlayer.id 
        ? { ...benchPlayer, x: oldPlayerX, y: oldPlayerY, isStarter: true }
        : p
    );

    const updatedBench = benchPlayers
      .filter(p => p.id !== benchPlayer.id)
      .concat({ ...selectedPlayer, x: 0, y: 0, isStarter: false });

    setPlayers(updatedStarters);
    setBenchPlayers(updatedBench);
    setShowModal(false);
    setShowSubstitutes(false);
    setSelectedPlayer(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Team</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading squad...</Text>
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
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.playerName}>{player.name}</Text>
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
                    <Image
                      source={{ uri: selectedPlayer.photo }} 
                      style={styles.playerImage}
                    />
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
                </View>

                <View style={styles.hint}>
                  <Text style={styles.hintText}>
                    Drag the player on the field to change their position
                  </Text>
                </View>

                {!showSubstitutes ? (
                  <TouchableOpacity
                    style={styles.substituteButton}
                    onPress={() => setShowSubstitutes(true)}
                  >
                    <Text style={styles.substituteButtonText}>🔄 Substitute Player</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.substituteSection}>
                    <Text style={styles.substituteSectionTitle}>Select Substitute:</Text>
                    <ScrollView style={styles.benchList}>
                      {benchPlayers.map(benchPlayer => (
                        <TouchableOpacity
                          key={benchPlayer.id}
                          style={styles.benchPlayerCard}
                          onPress={() => handleSubstitute(benchPlayer)}
                        >
                          <View style={styles.benchPlayerCircle}>
                            <Text style={styles.benchPlayerNumber}>{benchPlayer.number}</Text>
                          </View>
                          <View style={styles.benchPlayerInfo}>
                            <Text style={styles.benchPlayerName}>{benchPlayer.name}</Text>
                            <Text style={styles.benchPlayerPosition}>
                              {benchPlayer.position} • {benchPlayer.age} yrs
                            </Text>
                          </View>
                          <Text style={styles.substituteArrow}>→</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowSubstitutes(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
    width: '115%',
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
    textAlign: 'center',
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
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  playerImage: {
    width: '100%',
    height: '100%',
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
  substituteButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  substituteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  substituteSection: {
    marginTop: 16,
  },
  substituteSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  benchList: {
    maxHeight: 200,
  },
  benchPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  benchPlayerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benchPlayerNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  benchPlayerInfo: {
    flex: 1,
  },
  benchPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  benchPlayerPosition: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  substituteArrow: {
    fontSize: 20,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
});