import { useCallback } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useAppDispatch, useAppSelector } from '@shared/lib/redux';
import { Button, StarIcon } from '@shared/ui';
import type { ButtonVariant, IconTone } from '@shared/ui';
import { favoriteToggled } from '../model/favoritesSlice';
import { selectIsFavorite } from '../model/selectors';

type FavoriteStatus = 'favorite' | 'regular';

type ToggleAppearance = {
  label: string;
  variant: ButtonVariant;
  iconTone: IconTone;
  announcementAfterToggle: string;
};

const APPEARANCES = {
  favorite: {
    label: 'Remove from favorites',
    variant: 'primary',
    iconTone: 'on-primary',
    announcementAfterToggle: 'Removed from favorites',
  },
  regular: {
    label: 'Add to favorites',
    variant: 'outline',
    iconTone: 'primary',
    announcementAfterToggle: 'Added to favorites',
  },
} as const satisfies Record<FavoriteStatus, ToggleAppearance>;

const TOGGLE_HINT =
  'Favorite posts are highlighted and pinned to the top of the list';

type FavoriteToggleButtonProps = {
  postId: number;
};

export const FavoriteToggleButton = ({ postId }: FavoriteToggleButtonProps) => {
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector(state => selectIsFavorite(state, postId));
  const appearance = APPEARANCES[isFavorite ? 'favorite' : 'regular'];

  const handlePress = useCallback(() => {
    dispatch(favoriteToggled(postId));
    AccessibilityInfo.announceForAccessibility(
      appearance.announcementAfterToggle,
    );
  }, [dispatch, postId, appearance]);

  return (
    <Button
      label={appearance.label}
      variant={appearance.variant}
      icon={<StarIcon isFilled={isFavorite} tone={appearance.iconTone} />}
      isSelected={isFavorite}
      accessibilityHint={TOGGLE_HINT}
      onPress={handlePress}
    />
  );
};
