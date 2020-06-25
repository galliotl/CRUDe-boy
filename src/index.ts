// 3rd party libraries
import * as mongoose from 'mongoose';
import { Request, Response } from 'express';

import { getQueryParamAsList } from './helpers';

export default class CRUDController {
  /**
   * The mongoose model to be used here.
   * All updates and writes are here done without any verification.
   * This implies that you use strong verification middlewares to not
   * risk any security issues.
   */
  model: mongoose.Model<any>;

  /**
   * Name of the model. Will be used in error messages and so on.
   */
  name: string;

  /**
   * JSON configuration holding some informations. The definition bellow gives
   * defaults values that will be overriden by the constructor if other values
   * are given.
   */
  config = {
    paginationLimit: 20,
  };

  constructor(model: mongoose.Model<any>, name: string, config?: any) {
    this.model = model;
    this.name = name;
    if (config) this.config = { ...this.config, ...config };
  }

  /**
   * Dispatches the request to sub handlers given the
   * type of data -> object or array of objects.
   * @param req - express request
   * @param res - express response
   */
  postController = async (req: Request, res: Response) => {
    const { data } = req.body;
    if (!data) return res.status(400).send('missing data');
    if (Array.isArray(data)) return this.createMultiple(req, res);
    if (data.constructor === {}.constructor) {
      return this.createSingle(req, res);
    }
    return res.status(422).send(`Unprocessable type ${typeof data}`);
  };

  /**
   * Dispatches the request to sub handlers given
   * the need to fetch one or multiple items.
   * @param req - express request
   * @param res - express response
   */
  getController = async (req: Request, res: Response) => {
    if (req.params.id || req.query.id) return this.getSingle(req, res);
    if (req.query.ids) return this.getByIds(req, res);
    if (req.query.offset) return this.getAllPaginated(req, res);
    return this.getAll(req, res);
  };

  /**
   * Dispatches the request to sub handlers given
   * the need to update one or multiple items.
   * @param req - express request
   * @param res - express response
   */
  putController = async (req: Request, res: Response) => {
    if (!req.body.data) return res.status(400).send('missing data');
    if (req.params.id || req.body.id) return this.updateSingle(req, res);
    if (req.body.ids) return this.updateMultiple(req, res);
    return res.status(400).send('missing ids');
  };

  /**
   * Dispatches the request to sub handlers given
   * the need to delete one or multiple items.
   * @param req - express request
   * @param res - express response
   */
  deleteController = async (req: Request, res: Response) => {
    if (req.params.id || req.query.id) return this.deleteSingle(req, res);
    if (req.query.ids || req.body.ids) {
      return this.deleteMultiple(req, res);
    }
    return res.status(400).send('missing ids');
  };

  /**
   * Fetches a single element
   */
  getSingle = async (req: Request, res: Response) => {
    const id = req.params.id ? req.params.id : req.query.id;
    try {
      const item = await this.model.findById(id).exec();
      if (!item) return res.status(422).send(`${this.name} doesn't exist`);
      return res.status(200).send(item);
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  /**
   * Fetches a list of items from their ids.
   */
  getByIds = async (req: Request, res: Response) => {
    const ids = getQueryParamAsList(req.query.ids);
    try {
      const items = await this.model.find().where('_id').in(ids).exec();
      return res.status(200).json({ data: items });
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  /**
   * Fetches all the items using pagination
   */
  getAllPaginated = async (req: Request, res: Response) => {
    const offset = Number(req.query.offset);
    const limit = req.query.offset
      ? Number(req.query.offset)
      : this.config.paginationLimit;
    try {
      const items = await this.model.find({}).skip(offset).limit(limit).exec();
      return res.status(200).json({ data: items, offset, limit });
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  /**
   * Fetches all the items.
   */
  getAll = async (req: Request, res: Response) => {
    try {
      const items = await this.model.find({}).exec();
      return res.status(200).json({ data: items });
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  /**
   * Deletes a single item from its id
   */
  deleteSingle = async (req: Request, res: Response) => {
    const id = req.params.id ? req.params.id : req.query.id;
    try {
      await this.model.findByIdAndRemove(id);
      return res.send(204).send('deleted');
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  /**
   * Deletes multiple items given an id list
   */
  deleteMultiple = async (req: Request, res: Response) => {
    const ids = req.query.ids
      ? getQueryParamAsList(req.query.ids)
      : req.body.ids;
    try {
      await this.model.remove({ _id: { $in: ids } }).exec();
      return res.send(204).send('deleted');
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  /**
   * Updates a single item
   */
  updateSingle = async (req: Request, res: Response) => {
    const id = req.params.id ? req.params.id : req.body.id;
    try {
      const item = await this.model.findByIdAndUpdate(id, req.body.data);
      return res.status(200).json({ item });
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  /**
   * Updates multiple elements given their ids
   */
  updateMultiple = async (req: Request, res: Response) => {
    const ids = req.query.ids
      ? getQueryParamAsList(req.query.ids)
      : req.body.ids;
    try {
      const response = await this.model.updateMany(
        { _id: { $in: ids } },
        req.body.data,
      );
      return res.status(200).send(response);
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  /**
   * Creates a single item
   */
  createSingle = async (req: Request, res: Response) => {
    try {
      // eslint-disable-next-line new-cap
      const item = new this.model(req.body.data);
      await item.save();
      return res.status(200).send(item);
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  /**
   * Creates multiple items
   */
  createMultiple = async (req: Request, res: Response) => {
    try {
      const items = await this.model.insertMany(req.body.data);
      return res.status(200).json({ data: items });
    } catch (err) {
      return res.status(500).send(err);
    }
  };
}
