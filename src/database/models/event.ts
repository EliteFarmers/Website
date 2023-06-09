import { DataTypes, Model, Sequelize } from 'sequelize';
import type {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Optional,
	WhereAttributeHash,
} from 'sequelize';

export enum EventType {
	JacobLeaderboard = 'jacob',
	WeightGain = 'weightgain',
	CollectionGain = 'collectiongain',
	WeightLeaderboard = 'weight',
	CollectionLeaderboard = 'collection',
}

export interface EventMemberUpdate {
	weight?: number;
	collection?: number;
	timestamp: number;
}

export interface EventMember {
	id: string;
	uuid: string;
	startWeight?: number;
	endWeight?: number;
	startCollection?: number;
	endCollection?: number;
	boundTools?: string[];
	updates: EventMemberUpdate[];
}

export class Event extends Model<InferAttributes<Event>, InferCreationAttributes<Event>> {
	// Default
	// "| string" added to allow for the string substitution to work around SvelteKit's inability to serialize date objects.
	declare createdAt: CreationOptional<Date | string>;
	declare updatedAt: CreationOptional<Date | string>;

	// Added
	declare serverId: string;
	declare ownerId: string;
	declare name: string;
	declare description: string;
	declare type: EventType;

	declare posterChannelId: CreationOptional<string | null>;
	declare updateChannelId: CreationOptional<string | null>;
	declare adminRoleId: CreationOptional<string | null>;

	declare active: CreationOptional<boolean | null>;
	declare members: CreationOptional<string[] | null>;
	declare public: CreationOptional<boolean | null>;

	// Only allow or disallow certain roles from participating
	declare requiredRoles: CreationOptional<string[] | null>;
	declare bannedRoles: CreationOptional<string[] | null>;
	declare bannedMembers: CreationOptional<string[] | null>;
	declare bannedEntries: CreationOptional<string[] | null>;

	declare startTime: CreationOptional<number | null>;
	declare endTime: CreationOptional<number | null>;

	// Discord
	declare id: string;
}

export function EventsInit(sequelize: Sequelize) {
	Event.init(
		{
			id: {
				type: DataTypes.STRING,
				unique: true,
				primaryKey: true,
				allowNull: false,
			},

			serverId: DataTypes.STRING,
			ownerId: DataTypes.STRING,
			name: DataTypes.STRING,
			description: DataTypes.STRING,
			type: DataTypes.INTEGER,

			posterChannelId: DataTypes.STRING,
			updateChannelId: DataTypes.STRING,
			adminRoleId: DataTypes.STRING,

			members: DataTypes.ARRAY(DataTypes.JSONB),
			active: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			public: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},

			requiredRoles: DataTypes.ARRAY(DataTypes.STRING),
			bannedRoles: DataTypes.ARRAY(DataTypes.STRING),
			bannedMembers: DataTypes.ARRAY(DataTypes.STRING),
			bannedEntries: DataTypes.ARRAY(DataTypes.STRING),

			startTime: DataTypes.NUMBER,
			endTime: DataTypes.NUMBER,

			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize: sequelize,
			tableName: 'events',
			freezeTableName: true,
		}
	);
	return Event;
}

// No idea if this is how you're supposed to do it, but it works?
export type EventWhereOptions = WhereAttributeHash<Event>;

type EventCreationOptions = InferCreationAttributes<Event>;
export type EventUpdateOptions = Optional<EventCreationOptions, keyof EventCreationOptions>;

export type EventData = Event;
