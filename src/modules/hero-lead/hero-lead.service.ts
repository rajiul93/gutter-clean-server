import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { HeroLead } from './hero-lead.model';

export type HeroLeadPublicRow = {
  _id: string;
  name: string;
  phone: string;
  location: string;
  callback: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type LeanHeroLeadDoc = {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  location: string;
  callback?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type CreateInput = {
  name: string;
  phone: string;
  location: string;
};

export async function createHeroLead(input: CreateInput) {
  const doc = await HeroLead.create({
    name: input.name.trim(),
    phone: input.phone.trim(),
    location: input.location.trim(),
    callback: false,
  });
  return doc.toObject() as LeanHeroLeadDoc;
}

export async function listHeroLeads(page: number, limit: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(100, Math.floor(limit)) : 20;
  const skip = (safePage - 1) * safeLimit;
  const [items, total] = await Promise.all([
    HeroLead.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    HeroLead.countDocuments({}),
  ]);
  return { items: items as LeanHeroLeadDoc[], total, page: safePage, limit: safeLimit };
}

export async function setHeroLeadCallback(id: string, callback: boolean) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid id', httpStatus.BAD_REQUEST);
  }
  const updated = await HeroLead.findByIdAndUpdate(
    id,
    { $set: { callback } },
    { new: true, runValidators: true },
  ).lean();
  if (!updated) {
    throw new AppError('Hero lead not found', httpStatus.NOT_FOUND);
  }
  return updated as LeanHeroLeadDoc;
}

export function toPublicRow(doc: LeanHeroLeadDoc): HeroLeadPublicRow {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    location: doc.location,
    callback: Boolean(doc.callback),
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : undefined,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : undefined,
  };
}
