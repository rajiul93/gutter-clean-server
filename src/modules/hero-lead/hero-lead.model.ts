import { Schema, model } from 'mongoose';
import type { IHeroLead } from './hero-lead.interface';

const heroLeadSchema = new Schema<IHeroLead>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    callback: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const HeroLead = model<IHeroLead>('HeroLead', heroLeadSchema);
