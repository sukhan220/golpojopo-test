// DrawingCanvas.style.js
import { Dimensions, StyleSheet } from 'react-native';

const { width: windowWidth } = Dimensions.get('window');
export const CANVAS_WIDTH = windowWidth - 20;
export const CANVAS_HEIGHT = (CANVAS_WIDTH * 9) / 16;

export const styles = StyleSheet.create({
    drawModal: { flex: 1, backgroundColor: '#0f1014' },
    drawHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', backgroundColor: '#16171d' },
    colorPalette: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1014', padding: 8, borderRadius: 25 },
    colorCircle: { width: 18, height: 18, borderRadius: 9, marginHorizontal: 5 },
    actionTools: { flexDirection: 'row', gap: 10 },
    toolBtn: { padding: 8, borderRadius: 10, backgroundColor: '#25262b' },
    activeTool: { backgroundColor: '#b7c7ff' },
    canvasContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    shotBoundary: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, overflow: 'hidden', backgroundColor: '#16171d' },
    canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
    deleteFab: { position: 'absolute', top: 20, right: 20, backgroundColor: '#ff6b6b', padding: 15, borderRadius: 40 },
    footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, backgroundColor: '#16171d' },
    undoRedoGroup: { flexDirection: 'row', gap: 10 },
    footerBtn: { padding: 10, borderRadius: 15, backgroundColor: '#25262b' },
    activeFooterBtn: { backgroundColor: '#b7c7ff' },
    insertBtn: { backgroundColor: '#b7c7ff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30 },
    insertBtnText: { fontWeight: 'bold', color: '#000' },
    // --- Layer Control Bar Styles ---
  layerControlBar: {
    position: 'absolute',
    top: 90, // Header-এর ঠিক নিচে
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(37, 38, 43, 0.95)', // ডার্ক গ্লাস ইফেক্ট
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 100,
  },
  layerBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  layerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#323339',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerBtnText: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  layerSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
  },
});