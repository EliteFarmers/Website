/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/Account": {
    get: {
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["AuthorizedAccountDto"];
            "application/json": components["schemas"]["AuthorizedAccountDto"];
            "text/json": components["schemas"]["AuthorizedAccountDto"];
          };
        };
      };
    };
  };
  "/Account/{discordId}": {
    get: {
      parameters: {
        path: {
          discordId: number;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["MinecraftAccountDto"];
            "application/json": components["schemas"]["MinecraftAccountDto"];
            "text/json": components["schemas"]["MinecraftAccountDto"];
          };
        };
      };
    };
  };
  "/Account/{playerUuidOrIgn}": {
    get: {
      parameters: {
        path: {
          playerUuidOrIgn: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["MinecraftAccountDto"];
            "application/json": components["schemas"]["MinecraftAccountDto"];
            "text/json": components["schemas"]["MinecraftAccountDto"];
          };
        };
      };
    };
    post: {
      parameters: {
        path: {
          playerUuidOrIgn: string;
        };
      };
      responses: {
        /** @description Success */
        200: never;
      };
    };
    delete: {
      parameters: {
        path: {
          playerUuidOrIgn: string;
        };
      };
      responses: {
        /** @description Success */
        200: never;
      };
    };
  };
  "/Account/primary/{playerUuidOrIgn}": {
    post: {
      parameters: {
        path: {
          playerUuidOrIgn: string;
        };
      };
      responses: {
        /** @description Success */
        200: never;
      };
    };
  };
  "/Contests/at/{year}": {
    get: {
      parameters: {
        path: {
          year: number;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["YearlyContestsDto"];
            "application/json": components["schemas"]["YearlyContestsDto"];
            "text/json": components["schemas"]["YearlyContestsDto"];
          };
        };
      };
    };
  };
  "/Contests/at/now": {
    get: {
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["YearlyContestsDto"];
            "application/json": components["schemas"]["YearlyContestsDto"];
            "text/json": components["schemas"]["YearlyContestsDto"];
          };
        };
      };
    };
    post: {
      requestBody?: {
        content: {
          "application/json": {
            [key: string]: (string)[] | undefined;
          };
          "text/json": {
            [key: string]: (string)[] | undefined;
          };
          "application/*+json": {
            [key: string]: (string)[] | undefined;
          };
        };
      };
      responses: {
        /** @description Success */
        200: never;
      };
    };
  };
  "/Contests/at/{year}/{month}/{day}": {
    get: {
      parameters: {
        path: {
          year: number;
          month: number;
          day: number;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": (components["schemas"]["JacobContestWithParticipationsDto"])[];
            "application/json": (components["schemas"]["JacobContestWithParticipationsDto"])[];
            "text/json": (components["schemas"]["JacobContestWithParticipationsDto"])[];
          };
        };
      };
    };
  };
  "/Contests/at/{year}/{month}": {
    get: {
      parameters: {
        path: {
          year: number;
          month: number;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": {
              [key: string]: (components["schemas"]["JacobContestDto"])[] | undefined;
            };
            "application/json": {
              [key: string]: (components["schemas"]["JacobContestDto"])[] | undefined;
            };
            "text/json": {
              [key: string]: (components["schemas"]["JacobContestDto"])[] | undefined;
            };
          };
        };
      };
    };
  };
  "/Contests/{timestamp}": {
    get: {
      parameters: {
        path: {
          timestamp: number;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": (components["schemas"]["JacobContestWithParticipationsDto"])[];
            "application/json": (components["schemas"]["JacobContestWithParticipationsDto"])[];
            "text/json": (components["schemas"]["JacobContestWithParticipationsDto"])[];
          };
        };
      };
    };
  };
  "/contest/{contestKey}": {
    get: {
      parameters: {
        path: {
          contestKey: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["JacobContestWithParticipationsDto"];
            "application/json": components["schemas"]["JacobContestWithParticipationsDto"];
            "text/json": components["schemas"]["JacobContestWithParticipationsDto"];
          };
        };
      };
    };
  };
  "/Contests/{playerUuid}": {
    get: {
      parameters: {
        path: {
          playerUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": (components["schemas"]["ContestParticipationDto"])[];
            "application/json": (components["schemas"]["ContestParticipationDto"])[];
            "text/json": (components["schemas"]["ContestParticipationDto"])[];
          };
        };
      };
    };
  };
  "/Contests/{playerUuid}/{profileUuid}": {
    get: {
      parameters: {
        path: {
          playerUuid: string;
          profileUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": (components["schemas"]["ContestParticipationDto"])[];
            "application/json": (components["schemas"]["ContestParticipationDto"])[];
            "text/json": (components["schemas"]["ContestParticipationDto"])[];
          };
        };
      };
    };
  };
  "/Contests/{playerUuid}/Selected": {
    get: {
      parameters: {
        path: {
          playerUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": (components["schemas"]["ContestParticipationDto"])[];
            "application/json": (components["schemas"]["ContestParticipationDto"])[];
            "text/json": (components["schemas"]["ContestParticipationDto"])[];
          };
        };
      };
    };
  };
  "/Leaderboard/{id}": {
    get: {
      parameters: {
        query?: {
          offset?: number;
          limit?: number;
        };
        path: {
          id: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["LeaderboardDto"];
            "application/json": components["schemas"]["LeaderboardDto"];
            "text/json": components["schemas"]["LeaderboardDto"];
          };
        };
      };
    };
  };
  "/Leaderboard/skill/{skillName}": {
    get: {
      parameters: {
        query?: {
          offset?: number;
          limit?: number;
        };
        path: {
          skillName: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["LeaderboardDto"];
            "application/json": components["schemas"]["LeaderboardDto"];
            "text/json": components["schemas"]["LeaderboardDto"];
          };
        };
      };
    };
  };
  "/Leaderboard/collection/{collection}": {
    get: {
      parameters: {
        query?: {
          offset?: number;
          limit?: number;
        };
        path: {
          collection: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["LeaderboardDto"];
            "application/json": components["schemas"]["LeaderboardDto"];
            "text/json": components["schemas"]["LeaderboardDto"];
          };
        };
      };
    };
  };
  "/Leaderboard/ranks/{playerUuid}/{profileUuid}": {
    get: {
      parameters: {
        path: {
          playerUuid: string;
          profileUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["LeaderboardPositionsDto"];
            "application/json": components["schemas"]["LeaderboardPositionsDto"];
            "text/json": components["schemas"]["LeaderboardPositionsDto"];
          };
        };
      };
    };
  };
  "/Leaderboard/rank/{leaderboardId}/{playerUuid}/{profileUuid}": {
    get: {
      parameters: {
        query?: {
          includeUpcoming?: boolean;
        };
        path: {
          leaderboardId: string;
          playerUuid: string;
          profileUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["LeaderboardPositionDto"];
            "application/json": components["schemas"]["LeaderboardPositionDto"];
            "text/json": components["schemas"]["LeaderboardPositionDto"];
          };
        };
      };
    };
  };
  "/Login/callback": {
    get: {
      parameters: {
        query?: {
          code?: string;
          state?: string;
          error?: string;
        };
      };
      responses: {
        /** @description Success */
        200: never;
      };
    };
  };
  "/Player/{playerUuidOrIgn}": {
    get: {
      parameters: {
        path: {
          playerUuidOrIgn: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["PlayerDataDto"];
            "application/json": components["schemas"]["PlayerDataDto"];
            "text/json": components["schemas"]["PlayerDataDto"];
          };
        };
      };
    };
  };
  "/Player/{discordId}": {
    get: {
      parameters: {
        path: {
          discordId: number;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["LinkedAccountsDto"];
            "application/json": components["schemas"]["LinkedAccountsDto"];
            "text/json": components["schemas"]["LinkedAccountsDto"];
          };
        };
      };
    };
  };
  "/Profile/{uuid}/Selected": {
    get: {
      parameters: {
        path: {
          uuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["ProfileMemberDto"];
            "application/json": components["schemas"]["ProfileMemberDto"];
            "text/json": components["schemas"]["ProfileMemberDto"];
          };
        };
      };
    };
  };
  "/Profile/{playerUuid}/{profileUuid}": {
    get: {
      parameters: {
        path: {
          playerUuid: string;
          profileUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["ProfileMemberDto"];
            "application/json": components["schemas"]["ProfileMemberDto"];
            "text/json": components["schemas"]["ProfileMemberDto"];
          };
        };
      };
    };
  };
  "/Profile/{profileUuid}": {
    get: {
      parameters: {
        path: {
          profileUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["ProfileDetailsDto"];
            "application/json": components["schemas"]["ProfileDetailsDto"];
            "text/json": components["schemas"]["ProfileDetailsDto"];
          };
        };
      };
    };
  };
  "/Profiles/{playerUuid}": {
    get: {
      parameters: {
        path: {
          playerUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": (components["schemas"]["ProfileDetailsDto"])[];
            "application/json": (components["schemas"]["ProfileDetailsDto"])[];
            "text/json": (components["schemas"]["ProfileDetailsDto"])[];
          };
        };
      };
    };
  };
  "/Weight/{playerUuid}": {
    get: {
      parameters: {
        path: {
          playerUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": (components["schemas"]["FarmingWeightWithProfileDto"])[];
            "application/json": (components["schemas"]["FarmingWeightWithProfileDto"])[];
            "text/json": (components["schemas"]["FarmingWeightWithProfileDto"])[];
          };
        };
      };
    };
  };
  "/Weight/{playerUuid}/Selected": {
    get: {
      parameters: {
        path: {
          playerUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["FarmingWeightDto"];
            "application/json": components["schemas"]["FarmingWeightDto"];
            "text/json": components["schemas"]["FarmingWeightDto"];
          };
        };
      };
    };
  };
  "/Weight/{playerUuid}/{profileUuid}": {
    get: {
      parameters: {
        path: {
          playerUuid: string;
          profileUuid: string;
        };
      };
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": components["schemas"]["FarmingWeightDto"];
            "application/json": components["schemas"]["FarmingWeightDto"];
            "text/json": components["schemas"]["FarmingWeightDto"];
          };
        };
      };
    };
  };
  "/Weights": {
    get: {
      responses: {
        /** @description Success */
        200: {
          content: {
            "text/plain": {
              [key: string]: number | undefined;
            };
            "application/json": {
              [key: string]: number | undefined;
            };
            "text/json": {
              [key: string]: number | undefined;
            };
          };
        };
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    AuthorizedAccountDto: {
      id?: string;
      displayName?: string;
      username?: string;
      discriminator?: string | null;
      email?: string | null;
      locale?: string | null;
      avatar?: string | null;
      redemptions?: (components["schemas"]["RedemptionDto"])[];
      inventory?: components["schemas"]["EliteInventoryDto"];
      settings?: components["schemas"]["EliteSettingsDto"];
      minecraftAccounts?: (components["schemas"]["MinecraftAccountDetailsDto"])[];
    };
    ContestParticipationDto: {
      crop?: string;
      /** Format: int64 */
      timestamp?: number;
      /** Format: int32 */
      collected?: number;
      /** Format: int32 */
      position?: number;
      /** Format: int32 */
      participants?: number;
      medal?: string | null;
    };
    EliteInventoryDto: {
      totalEarnedMedals?: components["schemas"]["MedalInventoryDto"];
      spentMedals?: components["schemas"]["MedalInventoryDto"];
      /** Format: int32 */
      eventTokens?: number;
      /** Format: int32 */
      eventTokensSpent?: number;
      /** Format: int32 */
      leaderboardTokens?: number;
      /** Format: int32 */
      leaderboardTokensSpent?: number;
      unlockedCosmetics?: (string)[];
    };
    EliteSettingsDto: {
      defaultPlayerUuid?: string;
      hideDiscordTag?: boolean;
    };
    FarmingWeightDto: {
      /** Format: double */
      totalWeight?: number;
      cropWeight?: {
        [key: string]: number | undefined;
      };
      bonusWeight?: {
        [key: string]: number | undefined;
      };
    };
    FarmingWeightWithProfileDto: {
      profileId?: string;
      profileName?: string;
      /** Format: double */
      totalWeight?: number;
      cropWeight?: {
        [key: string]: number | undefined;
      };
      bonusWeight?: {
        [key: string]: number | undefined;
      };
    };
    JacobContestDto: {
      crop?: string;
      /** Format: int64 */
      timestamp?: number;
      /** Format: int32 */
      participants?: number;
    };
    JacobContestWithParticipationsDto: {
      crop?: string;
      /** Format: int64 */
      timestamp?: number;
      /** Format: int32 */
      participants?: number;
      participations?: (components["schemas"]["StrippedContestParticipationDto"])[];
    };
    JacobDataDto: {
      medals?: components["schemas"]["MedalInventoryDto"];
      earnedMedals?: components["schemas"]["MedalInventoryDto"];
      perks?: components["schemas"]["JacobPerksDto"];
      /** Format: int32 */
      participations?: number;
      contests?: (components["schemas"]["ContestParticipationDto"])[];
    };
    JacobPerksDto: {
      /** Format: int32 */
      doubleDrops?: number;
      /** Format: int32 */
      levelCap?: number;
    };
    LeaderboardDto: {
      id?: string;
      title?: string;
      /** Format: int32 */
      limit?: number;
      /** Format: int32 */
      offset?: number;
      entries?: (components["schemas"]["LeaderboardEntry"])[];
    };
    LeaderboardEntry: {
      memberId?: string;
      ign?: string | null;
      profile?: string | null;
      /** Format: double */
      amount?: number;
    };
    LeaderboardPositionDto: {
      /** Format: int32 */
      rank?: number;
      upcomingPlayers?: (components["schemas"]["LeaderboardEntry"])[] | null;
    };
    LeaderboardPositionsDto: {
      misc?: {
        [key: string]: number | undefined;
      };
      skills?: {
        [key: string]: number | undefined;
      };
      collections?: {
        [key: string]: number | undefined;
      };
    };
    LinkedAccountsDto: {
      selectedUuid?: string | null;
      players?: (components["schemas"]["PlayerDataDto"])[];
    };
    MedalInventoryDto: {
      /** Format: int32 */
      bronze?: number;
      /** Format: int32 */
      silver?: number;
      /** Format: int32 */
      gold?: number;
    };
    MemberDetailsDto: {
      uuid?: string;
      username?: string;
      active?: boolean;
    };
    MinecraftAccountDetailsDto: {
      id?: string;
      name?: string;
      primaryAccount?: boolean;
      properties?: (components["schemas"]["MinecraftAccountPropertyDto"])[];
    };
    MinecraftAccountDto: {
      id?: string;
      name?: string;
      primaryAccount?: boolean;
      discordId?: string | null;
      discordUsername?: string | null;
      discordAvatar?: string | null;
      properties?: (components["schemas"]["MinecraftAccountPropertyDto"])[];
      profiles?: (components["schemas"]["ProfileDetailsDto"])[];
      playerData?: components["schemas"]["PlayerDataDto"];
    };
    MinecraftAccountPropertyDto: {
      name?: string;
      value?: string;
    };
    PetDto: {
      uuid?: string | null;
      type?: string;
      /** Format: double */
      exp?: number;
      active?: boolean;
      tier?: string | null;
      heldItem?: string | null;
      /** Format: int32 */
      candyUsed?: number;
      skin?: string | null;
    };
    PlayerDataDto: {
      uuid?: string;
      displayname?: string | null;
      /** Format: int64 */
      firstLogin?: number;
      /** Format: int64 */
      lastLogin?: number;
      /** Format: int64 */
      lastLogout?: number;
      /** Format: int32 */
      karma?: number;
      /** Format: double */
      networkExp?: number;
      /** Format: int32 */
      rewardHighScore?: number;
      /** Format: int32 */
      rewardScore?: number;
      /** Format: int32 */
      rewardStreak?: number;
      /** Format: int32 */
      totalDailyRewards?: number;
      /** Format: int32 */
      totalRewards?: number;
      rank?: string | null;
      newPackageRank?: string | null;
      rankPlusColor?: string | null;
      monthlyPackageRank?: string | null;
      mostRecentMonthlyPackageRank?: string | null;
      monthlyRankColor?: string | null;
      socialMedia?: components["schemas"]["SocialMediaLinksDto"];
    };
    ProfileDetailsDto: {
      profileId?: string;
      profileName?: string;
      gameMode?: string;
      selected?: boolean;
      /** Format: double */
      bankBalance?: number;
      members?: (components["schemas"]["MemberDetailsDto"])[];
    };
    ProfileMemberDto: {
      profileId?: string;
      playerUuid?: string;
      /** Format: int32 */
      skyblockXp?: number;
      /** Format: double */
      purse?: number;
      /** Format: double */
      bankBalance?: number;
      collections?: {
        [key: string]: number | undefined;
      };
      collectionTiers?: {
        [key: string]: number | undefined;
      };
      craftedMinions?: {
        [key: string]: number | undefined;
      };
      pets?: (components["schemas"]["PetDto"])[];
      jacob?: components["schemas"]["JacobDataDto"];
      farmingWeight?: components["schemas"]["FarmingWeightDto"];
      skills?: components["schemas"]["SkillsDto"];
      isSelected?: boolean;
      wasRemoved?: boolean;
      /** Format: int64 */
      lastUpdated?: number;
    };
    RedemptionDto: {
      itemId?: string;
      cost?: string;
      /** Format: date-time */
      timestamp?: string;
    };
    SkillsDto: {
      /** Format: double */
      farming?: number;
      /** Format: double */
      mining?: number;
      /** Format: double */
      combat?: number;
      /** Format: double */
      foraging?: number;
      /** Format: double */
      fishing?: number;
      /** Format: double */
      enchanting?: number;
      /** Format: double */
      alchemy?: number;
      /** Format: double */
      carpentry?: number;
      /** Format: double */
      runecrafting?: number;
      /** Format: double */
      taming?: number;
      /** Format: double */
      social?: number;
    };
    SocialMediaLinksDto: {
      discord?: string | null;
      hypixel?: string | null;
      youtube?: string | null;
    };
    StrippedContestParticipationDto: {
      /** Format: int32 */
      collected?: number;
      /** Format: int32 */
      position?: number;
      medal?: string | null;
      playerUuid?: string;
      playerName?: string;
    };
    YearlyContestsDto: {
      /** Format: int32 */
      year?: number;
      /** Format: int32 */
      count?: number;
      complete?: boolean;
      contests?: {
        [key: string]: (string)[] | undefined;
      };
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export type operations = Record<string, never>;
