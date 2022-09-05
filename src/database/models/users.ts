import type { AccountInfo, PlayerInfo, Profiles } from '$lib/skyblock.d';
import { DataTypes, Model, Sequelize } from 'sequelize';
import type {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Optional,
	WhereAttributeHash,
} from 'sequelize';

export interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string;
	avatar_decoration?: string | null;
	email: string;
	verified: boolean;
	mfa_enabled: boolean;
	locale: string;
	premium_type?: string;
	public_flags: number;
	flags: number;
	premium_since?: string;
	banner?: string | null;
	banner_color?: string | null;
	accent_color?: string | null;
}

export interface UserInfo {
	linked: boolean;
	id: string | null;
	cheating: boolean;
	times_fetched: number;
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

	// Discord
	declare id: CreationOptional<string | null>;
	declare user: CreationOptional<DiscordUser | null>;
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
