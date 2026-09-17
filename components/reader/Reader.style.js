// DrawingCanvas.style.js
import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';

const { width: windowWidth } = Dimensions.get('window');
export const CANVAS_WIDTH = windowWidth - 20;
export const CANVAS_HEIGHT = (CANVAS_WIDTH * 9) / 16;

const GOLD = '#D4AF37';


export default styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ede6d1',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
  },
  webview: { flex: 1, backgroundColor: '#f5f5dc', },
  compactSettings: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  controlBtn: { paddingHorizontal: 8, fontWeight: 'bold', color: '#3b2f1b' },
  iconBtn: { padding: 5 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#ede6d1',
  },
  pageIndicator: { fontWeight: 'bold', color: '#3b2f1b', fontSize: 16 },
  selectorCompact: {
    paddingHorizontal: 8,
    borderLeftWidth: 1,
    borderColor: '#ccc',
    marginLeft: 5,
  },
  selectorText: { fontSize: 12, color: '#3b2f1b' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignSelf: 'center',
  },
  popupSmall: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '70%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    textAlign: 'center',
  },
  goBtn: {
    backgroundColor: '#6b4f2d',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 10
  },
  chapterSidebar: {
    width: '75%',
    height: '100%',
    backgroundColor: '#f5f5dc',
    padding: 20,
    paddingTop: 50,
  },
  chapterHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3b2f1b',
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  chapterTitle: { fontSize: 16, color: '#3b2f1b', fontWeight: '500' },
  chapterPage: { fontSize: 12, color: 'gray' },
  selectionBar: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    elevation: 5,
  },
  saveBtn: {
    backgroundColor: '#6b4f2d',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelText: { color: '#999', fontSize: 16 },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    alignSelf: 'center',
  },
  titleInput: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    fontSize: 16,
    color: '#3b2f1b',
    padding: 5
  },
  noteInput: {
    borderColor: '#ddd',
    color: '#3b2f1b',
    minHeight: 60,
    textAlignVertical: 'top'
  },
  quoteBox: {
    marginTop: 15,
    padding: 10,
    borderLeftWidth: 4,
    borderColor: '#6b4f2d',
    backgroundColor: '#f9f6ef',
  },
  quoteText: { fontStyle: 'italic', color: '#3b2f1b' },
  spreadContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e0d5c1',
  },
  singlePage: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fdfaf1',
    marginHorizontal: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '50%',
  },
  webviewPage: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#c0392b',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 10,
  },

  contextMenu: {
    position: 'absolute',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 6,
    minWidth: 120,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  jumpOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'center',
  alignItems: 'center'
},

jumpBox: {
  width: 280,
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  elevation: 8,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 10
},

jumpTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 4,
  color: GOLD
},

jumpSubtitle: {
  fontSize: 13,
  textAlign: 'center',
  color: '#777',
  marginBottom: 16
},

jumpInput: {
  borderWidth: 1,
  color: '#232020',
  borderColor: '#232020',
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 12,
  fontSize: 16,
  textAlign: 'center',
  marginBottom: 16
},

jumpButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between'
},

cancelBtn: {
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 10,
  backgroundColor: '#eee'
},

cancelText: {
  fontWeight: 'bold',
  color: '#555'
},

jumpBtn: {
  paddingVertical: 10,
  paddingHorizontal: 22,
  borderRadius: 10,
  backgroundColor: GOLD
},

jumpBtnText: {
  color: '#fff',
  fontWeight: 'bold'
}

  

});