import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1a1a1a' 
  },
  inner: { 
    padding: 20,
    paddingBottom: 100, // Add padding to account for the fixed button
  },
  title: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 40,
  },
  choiceBox: {
    flex: 1, // Add this to make the boxes equal width
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center', // Center the text
  },
  choiceBoxSelected: {
    backgroundColor: '#ff2d55',
    borderColor: '#ff2d55',
  },
  choiceText: {
    color: '#fff',
    fontSize: 16,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#777',
  },
  tagSelected: {
    backgroundColor: '#0af',
    borderColor: '#0af',
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
  },
  nextButton: {
    position: 'absolute', // Make it fixed at the bottom
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#ff2d55',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 6,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  backWrapper: {
  position: 'absolute',
  top: 10,
  left: 10,
  padding: 6,
  borderRadius: 22,
  zIndex: 10,
},
venueCard: {
  width: '48%',
  aspectRatio: 1,
  backgroundColor: '#222',
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#444',
},
venueCardSelected: {
  borderColor: '#ff2d55',
  backgroundColor: '#2a2a2a',
},
venueEmoji: {
  fontSize: 30,
  marginBottom: 6,
},
venueText: {
  color: '#fff',
  fontSize: 14,
},
skipWrapper: {
  position: 'absolute',
  top: 10,
  right: 20,
  zIndex: 10,
  padding: 6,
},

skipText: {
  color: '#999',
  fontSize: 14,
},

});