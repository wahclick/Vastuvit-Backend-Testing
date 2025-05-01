import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from 'mongoose';
export type FirmsDocument = Firms & Document;
@Schema({ timestamps: true })
export class Firms {
    @Prop({ required: true, maxlength: 20 })
    name: string

    @Prop({ type: Object })
    address: {
        buildingNumber: string,
        streetArea: string,
        landmark: string,
        city: string,
        country: string
    };



    @Prop()
    logo: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TopManagement', required: true })
    ownerId: MongooseSchema.Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean


    @Prop({ default: 'free' })
    plan: string;

    @Prop()
    subscriptionStartDate: Date;

    @Prop()
    subscriptionEndDate: Date;
}

export const FirmSchema = SchemaFactory.createForClass(Firm);