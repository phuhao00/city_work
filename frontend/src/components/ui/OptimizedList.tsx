import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { debounce, throttle, runAfterInteractions } from '../../utils/PerformanceUtils';
import { cacheManager } from '../../utils/CacheManager';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onRefresh?: () => Promise<void>;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  numColumns?: number;
  horizontal?: boolean;
  estimatedItemSize?: number;
  cacheKey?: string;
  enableVirtualization?: boolean;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  initialNumToRender?: number;
  removeClippedSubviews?: boolean;
  getItemLayout?: (data: T[] | null | undefined, index: number) => {
    length: number;
    offset: number;
    index: number;
  };
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  contentContainerStyle?: any;
  style?: any;
  testID?: string;
}

export function OptimizedList<T>({
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.1,
  numColumns = 1,
  horizontal = false,
  estimatedItemSize = 50,
  cacheKey,
  enableVirtualization = true,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  initialNumToRender = 10,
  removeClippedSubviews = Platform.OS === 'android',
  getItemLayout,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  contentContainerStyle,
  style,
  testID,
}: OptimizedListProps<T>) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 缓存数据
  useEffect(() => {
    if (cacheKey && data.length > 0) {
      runAfterInteractions(() => {
        cacheManager.set(cacheKey, data, 5 * 60 * 1000); // 缓存5分钟
      });
    }
  }, [data, cacheKey]);

  // 优化的刷新处理
  const handleRefresh = useCallback(async () => {
    if (!onRefresh || refreshing) return;

    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshing]);

  // 防抖的滚动到底部处理
  const debouncedEndReached = useMemo(
    () => debounce(() => {
      if (onEndReached && !loading) {
        setLoading(true);
        runAfterInteractions(() => {
          onEndReached();
          setLoading(false);
        });
      }
    }, 300),
    [onEndReached, loading]
  );

  // 优化的渲染项
  const optimizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      return (
        <View key={keyExtractor(item, index)}>
          {renderItem({ item, index })}
        </View>
      );
    },
    [renderItem, keyExtractor]
  );

  // 自动计算布局（如果没有提供）
  const autoGetItemLayout = useMemo(() => {
    if (getItemLayout) return getItemLayout;
    
    if (estimatedItemSize && !horizontal) {
      return (data: T[] | null | undefined, index: number) => ({
        length: estimatedItemSize,
        offset: estimatedItemSize * index,
        index,
      });
    }
    
    return undefined;
  }, [getItemLayout, estimatedItemSize, horizontal]);

  // 优化的空状态组件
  const EmptyComponent = useMemo(() => {
    if (ListEmptyComponent) return ListEmptyComponent;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无数据</Text>
      </View>
    );
  }, [ListEmptyComponent]);

  // 优化的底部组件
  const FooterComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      );
    }
    
    return ListFooterComponent;
  }, [loading, ListFooterComponent]);

  return (
    <FlatList
      data={data}
      renderItem={optimizedRenderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      horizontal={horizontal}
      style={[styles.container, style]}
      contentContainerStyle={[
        data.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        ) : undefined
      }
      onEndReached={debouncedEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      getItemLayout={autoGetItemLayout}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={FooterComponent}
      ListEmptyComponent={EmptyComponent}
      // 性能优化配置
      removeClippedSubviews={removeClippedSubviews}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      initialNumToRender={initialNumToRender}
      updateCellsBatchingPeriod={50}
      disableVirtualization={!enableVirtualization}
      // 其他优化
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      testID={testID}
    />
  );
}

// 虚拟化网格列表组件
interface VirtualizedGridProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  numColumns: number;
  itemHeight: number;
  spacing?: number;
  onRefresh?: () => Promise<void>;
  onEndReached?: () => void;
  style?: any;
}

export function VirtualizedGrid<T>({
  data,
  renderItem,
  keyExtractor,
  numColumns,
  itemHeight,
  spacing = 10,
  onRefresh,
  onEndReached,
  style,
}: VirtualizedGridProps<T>) {
  const itemWidth = (screenWidth - spacing * (numColumns + 1)) / numColumns;

  const getItemLayout = useCallback(
    (data: T[] | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * Math.floor(index / numColumns),
      index,
    }),
    [itemHeight, numColumns]
  );

  const renderGridItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <View
        style={[
          styles.gridItem,
          {
            width: itemWidth,
            height: itemHeight,
            marginLeft: spacing,
            marginBottom: spacing,
          },
        ]}
      >
        {renderItem({ item, index })}
      </View>
    ),
    [renderItem, itemWidth, itemHeight, spacing]
  );

  return (
    <OptimizedList
      data={data}
      renderItem={renderGridItem}
      keyExtractor={keyExtractor}
      numColumns={1}
      getItemLayout={getItemLayout}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      style={style}
      contentContainerStyle={[styles.gridContainer, { paddingTop: spacing }]}
    />
  );
}

// 分组列表组件
interface GroupedListProps<T> {
  sections: Array<{
    title: string;
    data: T[];
  }>;
  renderItem: ({ item, index, section }: { item: T; index: number; section: any }) => React.ReactElement;
  renderSectionHeader?: ({ section }: { section: any }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onRefresh?: () => Promise<void>;
  style?: any;
}

export function GroupedList<T>({
  sections,
  renderItem,
  renderSectionHeader,
  keyExtractor,
  onRefresh,
  style,
}: GroupedListProps<T>) {
  // 将分组数据转换为平铺数据
  const flatData = useMemo(() => {
    const result: Array<{ type: 'header' | 'item'; data: any; sectionIndex: number; itemIndex?: number }> = [];
    
    sections.forEach((section, sectionIndex) => {
      // 添加分组头
      result.push({
        type: 'header',
        data: section,
        sectionIndex,
      });
      
      // 添加分组项
      section.data.forEach((item, itemIndex) => {
        result.push({
          type: 'item',
          data: item,
          sectionIndex,
          itemIndex,
        });
      });
    });
    
    return result;
  }, [sections]);

  const renderFlatItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (item.type === 'header') {
        return renderSectionHeader ? 
          renderSectionHeader({ section: item.data }) : 
          (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{item.data.title}</Text>
            </View>
          );
      }
      
      return renderItem({
        item: item.data,
        index: item.itemIndex!,
        section: sections[item.sectionIndex],
      });
    },
    [renderItem, renderSectionHeader, sections]
  );

  const flatKeyExtractor = useCallback(
    (item: any, index: number) => {
      if (item.type === 'header') {
        return `header-${item.sectionIndex}`;
      }
      return keyExtractor(item.data, item.itemIndex!);
    },
    [keyExtractor]
  );

  return (
    <OptimizedList
      data={flatData}
      renderItem={renderFlatItem}
      keyExtractor={flatKeyExtractor}
      onRefresh={onRefresh}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  gridContainer: {
    paddingHorizontal: 0,
  },
  gridItem: {
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default OptimizedList;