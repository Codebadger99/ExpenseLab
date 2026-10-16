import Brand from "./assets/Brand mark.png";
import Workspace from "./assets/Workspace preview.png";
import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";
import { DotFilledIcon } from "@radix-ui/react-icons";

const App = () => {
  return (
    <>
      <div className="flex justify-between items-center p-3">
        <div className="flex">
          <img src={Brand} alt="ExpenseLogo" />
          <p className="flex items-center mx-2">ExpenseLab</p>
        </div>
        <div className="flex gap-4">
          <p>Features</p>
          <p>How it works</p>
          <p>FAQ</p>
        </div>
        <div className="flex gap-2">
          <Button variant={"ghost"}>Log in</Button>
          <Button className="bg-[#158260]" size={"lg"}>
            Get Started
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center px-12 my-14">
        <div className="grid gap-5">
          <p className="text-xs text-[#158260] font-bold flex">
            {" "}
            <DotFilledIcon /> PERSONAL FINANCE, MADE CLEAR{" "}
          </p>
          <h1 className="text-7xl text-[#172D26] font-extrabold">
            Your Money. <br /> A clearer <br /> picture.
          </h1>
          <p className="text-balance text-[#78847E]">
            See where your money goes, plan for what matters, and understand the
            habits behind every purchase. All in one calm space workspace
          </p>

          <div className="flex gap-2 items-center">
            <Button className="bg-[#158260] p-5" size={"lg"}>
              {" "}
              <ArrowRight data-icon="inline-satr" /> Start your ExpenseLab
            </Button>
            <Button
              variant={"outline"}
              size={"lg"}
              className="text-[#172D26] p-5"
            >
              Explore the workspace
            </Button>
          </div>

          <div className="flex gap-2 items-center text-[#78847E]">
            <p>Spending</p> <DotFilledIcon />
            <p>Budgets</p> <DotFilledIcon />
            <p>Goals</p> <DotFilledIcon />
            <p>Reflection</p>
          </div>
        </div>
        <div>
          <img src={Workspace} alt="workspace-preview" />
        </div>
      </div>
    </>
  );
};

export default App;
