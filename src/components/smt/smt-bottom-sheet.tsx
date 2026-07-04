// components/smt/smt-bottom-sheet.tsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetProps as ExpoBottomSheetProps,
} from '@expo/ui/community/bottom-sheet';

export interface ReusableBottomSheetProps
  extends Omit<ExpoBottomSheetProps, 'children' | 'snapPoints' | 'index' | 'onChange' | 'onClose'> {
  snapPoints?: (string | number)[];
  initialIndex?: number;
  onChange?: (index: number) => void;
  onClose?: () => void;
  children?: React.ReactNode | (({ close }: { close: () => void }) => React.ReactNode);
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  handleStyle?: StyleProp<ViewStyle>;
  backgroundStyle?: StyleProp<ViewStyle>;
  showCloseButton?: boolean;
  closeButton?: React.ReactNode;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
}

export interface ReusableBottomSheetRef {
  snapToIndex: (index: number) => void;
  snapToPosition: (position: string | number) => void;
  close: () => void;
}

const ReusableBottomSheet = forwardRef<
  ReusableBottomSheetRef,
  ReusableBottomSheetProps
>(
  (
    {
      snapPoints = ['25%', '50%', '90%'],
      initialIndex = -1,
      onChange,
      onClose,
      children,
      containerStyle,
      contentStyle,
      handleStyle,
      backgroundStyle,
      showCloseButton = false,
      closeButton,
      title,
      titleStyle,
      enablePanDownToClose = true,
      ...rest
    },
    ref
  ) => {
    const sheetRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      snapToPosition: (position: string | number) =>
        sheetRef.current?.snapToPosition(position),
      close: () => sheetRef.current?.close(),
    }));

    const renderContent = () => {
      const closeSheet = () => sheetRef.current?.close();

      if (typeof children === 'function') {
        return children({ close: closeSheet });
      }

      return (
        <>
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
              {showCloseButton &&
                (closeButton || (
                  <Pressable onPress={closeSheet} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                  </Pressable>
                ))}
            </View>
          )}
          <View style={[styles.content, contentStyle]}>{children}</View>
        </>
      );
    };

    return (
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        index={initialIndex}
        onChange={onChange}
        onClose={onClose}
        enablePanDownToClose={enablePanDownToClose}
        style={[styles.container, containerStyle]}
        backgroundStyle={backgroundStyle}
        handleStyle={[styles.handle, handleStyle]}
        {...rest}
      >
        <BottomSheetView style={[styles.sheetView, contentStyle]}>
          {renderContent()}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ReusableBottomSheet.displayName = 'ReusableBottomSheet';

const styles = StyleSheet.create({
  container: { flex: 1 },
  sheetView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  closeText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
  },
  handle: {
    backgroundColor: '#ccc',
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  content: { flex: 1 },
});

export default ReusableBottomSheet;