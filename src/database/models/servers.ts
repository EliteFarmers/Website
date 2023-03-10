import { DataTypes, Model, Sequelize } from 'sequelize';
import type {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Optional,
	WhereAttributeHash,
} from 'sequelize';

export interface DiscordServer {
	id: string;

}

export class Server extends Model<InferAttributes<Server>, InferCreationAttributes<Server>> {
	// Default
	// "| string" added to allow for the string substitution to work around SvelteKit's inability to serialize date objects.
	declare createdAt: CreationOptional<Date | string>;
	declare updatedAt: CreationOptional<Date | string>;

	// Added


	// Discord
	declare id: string;
}

export function ServersInit(sequelize: Sequelize) {
	Server.init(
		{
			id: {
				type: DataTypes.STRING,
				unique: true,
				primaryKey: true,
				allowNull: false,
			},


			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize: sequelize,
			tableName: 'servers',
			freezeTableName: true,
		}
	);
	return Server;
}

// No idea if this is how you're supposed to do it, but it works?
export type ServerWhereOptions = WhereAttributeHash<Server>;

type ServerCreationOptions = InferCreationAttributes<Server>;
export type ServerUpdateOptions = Optional<ServerCreationOptions, keyof ServerCreationOptions>;

export type ServerData = Server;
