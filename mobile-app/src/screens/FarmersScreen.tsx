import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { getFarmers, Farmer, PaginatedResponse, getErrorMessage } from '../services/api';
import { Header } from '../components/Header';

export const FarmersScreen: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmers = useCallback(async (
    pageNum: number = 1,
    search?: string,
    append: boolean = false
  ) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      setError(null);

      const params: { page: number; pageSize: number; search?: string } = {
        page: pageNum,
        pageSize: 20,
      };
      if (search?.trim()) {
        params.search = search.trim();
      }

      const response = await getFarmers(params);
      const data = response.data as PaginatedResponse<Farmer>;

      setFarmers(append ? [...farmers, ...data.data] : data.data);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      console.warn('Failed to fetch farmers:', getErrorMessage(err));
      setError(getErrorMessage(err));

      // Demo fallback data
      if (!append) {
        setFarmers([
          {
            id: '1',
            name: 'Nguyen Van Minh',
            email: 'minh@greenvalley.vn',
            phone: '+84 912 345 678',
            farmName: 'Green Valley Farm',
            farmArea: 12.5,
            location: 'Lam Dong, Vietnam',
            status: 'active',
            joinedAt: '2023-06-15T00:00:00Z',
            totalHarvest: 8450,
          },
          {
            id: '2',
            name: 'Tran Thi Hoa',
            email: 'hoa@highland.vn',
            phone: '+84 923 456 789',
            farmName: 'Highland Arabica Farm',
            farmArea: 8.3,
            location: 'Dak Lak, Vietnam',
            status: 'active',
            joinedAt: '2023-08-22T00:00:00Z',
            totalHarvest: 5200,
          },
          {
            id: '3',
            name: 'Le Van Duc',
            email: 'duc@sunrise.vn',
            phone: '+84 934 567 890',
            farmName: 'Sunrise Estate',
            farmArea: 15.0,
            location: 'Gia Lai, Vietnam',
            status: 'active',
            joinedAt: '2023-03-10T00:00:00Z',
            totalHarvest: 12300,
          },
          {
            id: '4',
            name: 'Pham Minh Tuan',
            email: 'tuan@organic.vn',
            phone: '+84 945 678 901',
            farmName: 'Organic Hills',
            farmArea: 6.7,
            location: 'Kon Tum, Vietnam',
            status: 'inactive',
            joinedAt: '2023-11-05T00:00:00Z',
            totalHarvest: 3100,
          },
          {
            id: '5',
            name: 'Vo Thi Lan',
            email: 'lan@goldenbean.vn',
            phone: '+84 956 789 012',
            farmName: 'Golden Bean Cooperative',
            farmArea: 22.0,
            location: 'Lam Dong, Vietnam',
            status: 'active',
            joinedAt: '2022-12-01T00:00:00Z',
            totalHarvest: 18500,
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsSearching(false);
    }
  }, [farmers]);

  useEffect(() => {
    fetchFarmers(1, searchQuery);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchFarmers(1, searchQuery);
  }, [searchQuery, fetchFarmers]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    // Debounced search would be ideal; for simplicity, search on submit
  }, []);

  const handleSubmitSearch = useCallback(() => {
    fetchFarmers(1, searchQuery);
  }, [searchQuery, fetchFarmers]);

  const handleLoadMore = useCallback(() => {
    if (page < totalPages && !isLoading) {
      fetchFarmers(page + 1, searchQuery, true);
    }
  }, [page, totalPages, isLoading, searchQuery, fetchFarmers]);

  const renderFarmer = useCallback(({ item }: { item: Farmer }) => (
    <TouchableOpacity
      style={styles.farmerCard}
      activeOpacity={0.7}
      onPress={() => {
        // Navigation to detail handled via parent navigator
        // This will be connected through the navigation prop
      }}
    >
      <View style={styles.farmerHeader}>
        <View style={styles.farmerAvatar}>
          <Text style={styles.farmerAvatarText}>
            {item.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>{item.name}</Text>
          <Text style={styles.farmName}>{item.farmName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'active' ? Colors.successLight : Colors.errorLight,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: item.status === 'active' ? Colors.success : Colors.error,
              },
            ]}
          >
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.farmerDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📐</Text>
          <Text style={styles.detailText}>{item.farmArea} hectares</Text>
        </View>
        {item.totalHarvest !== undefined && (
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🫘</Text>
            <Text style={styles.detailText}>{item.totalHarvest.toLocaleString()} kg</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), []);

  return (
    <View style={styles.container}>
      <Header title="Farmers" subtitle="Manage farmer records" />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmitSearch}
            placeholder="Search farmers by name or farm..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchFarmers(1, ''); }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && farmers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading farmers...</Text>
        </View>
      ) : (
        <FlatList
          data={farmers}
          keyExtractor={(item) => item.id}
          renderItem={renderFarmer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && farmers.length > 0 ? (
              <ActivityIndicator size="small" color={Colors.primary} style={styles.footerLoader} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👨‍🌾</Text>
              <Text style={styles.emptyText}>No farmers found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Pull to refresh'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.lg,
  },
  clearIcon: {
    ...Typography.body,
    color: Colors.textLight,
    padding: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  farmerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  farmerAvatarText: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '700',
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  farmName: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  farmerDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    ...Typography.h4,
    color: Colors.text,
  },
  emptySubtext: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
});
