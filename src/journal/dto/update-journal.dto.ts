import { PartialType } from "@nestjs/mapped-types"
import { createdJournal } from "./create-journal.dto"

export class UpdatedJournal extends PartialType(createdJournal){}