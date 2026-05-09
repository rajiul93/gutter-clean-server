import { Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as HeroLeadService from './hero-lead.service';

function paramId(req: Request): string {
  const raw = req.params.id;
  if (Array.isArray(raw)) return raw[0] ?? '';
  return raw != null ? String(raw) : '';
}

const createPublic = catchAsync(async (req: Request, res: Response) => {
  const { name, phone, location } = req.body as Record<string, string>;
  const created = await HeroLeadService.createHeroLead({
    name: String(name ?? ''),
    phone: String(phone ?? ''),
    location: String(location ?? ''),
  });
  return sendResponse(res, httpStatus.CREATED, 'Quote request saved', HeroLeadService.toPublicRow(created));
});

const listAdmin = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const { items, total, ...rest } = await HeroLeadService.listHeroLeads(page, limit);
  const rows = items.map((item) =>
    HeroLeadService.toPublicRow(item),
  );
  return sendResponse(res, httpStatus.OK, 'Hero leads retrieved', {
    items: rows,
    total,
    ...rest,
  });
});

const patchCallback = catchAsync(async (req: Request, res: Response) => {
  const id = paramId(req);
  const { callback } = req.body as { callback?: unknown };
  if (typeof callback !== 'boolean') {
    throw new AppError('callback must be a boolean', httpStatus.BAD_REQUEST);
  }
  const updated = await HeroLeadService.setHeroLeadCallback(id, callback);
  return sendResponse(res, httpStatus.OK, 'Callback flag updated', HeroLeadService.toPublicRow(updated));
});

export const HeroLeadController = {
  createPublic,
  listAdmin,
  patchCallback,
};
