import type { AccountInfo, APISettings, PlayerInfo, Profiles } from '$lib/skyblock.d';
import { DataTypes, Model, Sequelize } from 'sequelize';
import type {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Optional,
	WhereAttributeHash,
} from 'sequelize';

export interface WeightBreakdown {
	total: number;
	bonus: number;
	sources: Record<string, number>;
	bonuses: Record<string, number>;
}

export interface WeightInfo {
	farming: WeightBreakdown;
	api: APISettings;
	cute_name: string;
}

export interface HighestWeights {
	farming: {
		weight: number;
		profile: string;
		crop: string;
	};
}

export type ProfileWeightInfo = Partial<Record<string, WeightInfo>>;

export interface UserInfo {
	linked: boolean;
	id: string | null;
	cheating: boolean;
	times_fetched: number;
	highest: HighestWeights;
	profiles: ProfileWeightInfo;
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	// Default
	// "| string" added to allow for the string substitution to work around SvelteKit's inability to serialize date objects.
	declare createdAt: CreationOptional<Date | string>;
	declare updatedAt: CreationOptional<Date | string>;

	// Added
	declare uuid: string;
	declare ign: CreationOptional<string | null>;

	declare skyblock: CreationOptional<Profiles | null>;
	declare account: CreationOptional<AccountInfo | null>;
	declare player: CreationOptional<PlayerInfo | null>;
	declare info: CreationOptional<UserInfo | null>;

	declare leaderboardCredits: CreationOptional<number | null>;
	declare eventCredits: CreationOptional<number | null>;

	// Discord
	declare id: CreationOptional<string | null>;
	declare user: CreationOptional<null>;
}

export function UsersInit(sequelize: Sequelize) {
	User.init(
		{
			uuid: {
				type: DataTypes.STRING,
				unique: true,
				primaryKey: true,
				allowNull: false,
			},
			id: DataTypes.STRING,
			ign: DataTypes.STRING,
			user: DataTypes.JSONB,

			skyblock: DataTypes.JSONB,
			account: DataTypes.JSONB,
			info: DataTypes.JSONB,
			// JSON because it won't be queried by subfields
			player: DataTypes.JSON,

			leaderboardCredits: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			eventCredits: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},

			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize: sequelize,
			tableName: 'users',
			freezeTableName: true,
		}
	);
	return User;
}

// No idea if this is how you're supposed to do it, but it works?
export type UserWhereOptions = WhereAttributeHash<User>;

type UserCreationOptions = InferCreationAttributes<User>;
export type UserUpdateOptions = Optional<UserCreationOptions, keyof UserCreationOptions>;

export type UserData = User;
