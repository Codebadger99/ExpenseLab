import { PartialType, PickType } from "@nestjs/mapped-types"
import { createdJournal } from "./create-journal.dto"

export class UpdatedJournal extends PartialType(
	PickType(createdJournal, ['why', 'worth', 'reflection'] as const),
) {}