import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional
} from 'sequelize';
import { getSequelizeInstance } from '../config/db';
import User from './User';

interface DeviceAttributes {
	deviceId: number;
	id: string;
	deviceName: string;
	deviceType: string;
	os: string;
	browser?: string | null;
	ipAddress: string;
	lastUsed: Date;
	isTrusted: boolean;
	creationDate: Date;
	lastUpdated: Date;
}

class Device
	extends Model<InferAttributes<Device>, InferCreationAttributes<Device>>
	implements DeviceAttributes
{
	deviceId!: number;
	id!: string;
	deviceName!: string;
	deviceType!: string;
	os!: string;
	browser!: string | null;
	ipAddress!: string;
	lastUsed!: CreationOptional<Date>;
	isTrusted!: boolean;
	creationDate!: CreationOptional<Date>;
	lastUpdated!: CreationOptional<Date>;
}

// Initialize the Device model
const sequelize = getSequelizeInstance();

Device.init(
	{
		deviceId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			unique: true
		},
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
			unique: true,
			references: {
				model: User,
				key: 'id'
			}
		},
		deviceName: {
			type: DataTypes.STRING,
			allowNull: true
		},
		deviceType: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isIn: [['desktop', 'laptop', 'tablet', 'mobile', 'other']]
			}
		},
		os: {
			type: DataTypes.STRING,
			allowNull: true
		},
		browser: {
			type: DataTypes.STRING,
			allowNull: true
		},
		ipAddress: {
			type: DataTypes.STRING,
			allowNull: false
		},
		lastUsed: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: true
		},
		isTrusted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		creationDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: false
		},
		lastUpdated: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: true
		}
	},
	{
		sequelize,
		modelName: 'Device',
		timestamps: true
	}
);

export default Device;
