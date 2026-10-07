import { PartialType } from "@nestjs/mapped-types";
import { createTransaction } from "./create-transaction.dto";

export class UpdateTransaction extends PartialType(createTransaction) {}