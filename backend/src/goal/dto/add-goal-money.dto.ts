import { IsNumber } from "class-validator";

export class addedMoney {
    @IsNumber()
    saved: number
}