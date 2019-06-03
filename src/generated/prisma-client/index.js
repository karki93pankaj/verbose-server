"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Permission",
    embedded: false
  },
  {
    name: "PageType",
    embedded: false
  },
  {
    name: "PageStatus",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "Page",
    embedded: false
  },
  {
    name: "Block",
    embedded: false
  },
  {
    name: "Box",
    embedded: false
  },
  {
    name: "AlertBox",
    embedded: false
  },
  {
    name: "QuickTip",
    embedded: false
  },
  {
    name: "ProsAndCons",
    embedded: false
  },
  {
    name: "Pros",
    embedded: false
  },
  {
    name: "Cons",
    embedded: false
  },
  {
    name: "Faq",
    embedded: false
  },
  {
    name: "FaqCategory",
    embedded: false
  },
  {
    name: "Component",
    embedded: false
  },
  {
    name: "Media",
    embedded: false
  },
  {
    name: "PageFaq",
    embedded: false
  },
  {
    name: "PageFaqAccordion",
    embedded: false
  },
  {
    name: "Grid",
    embedded: false
  },
  {
    name: "GridItem",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `${process.env["PRISMA_ENDPOINT"]}`
});
exports.prisma = new exports.Prisma();
