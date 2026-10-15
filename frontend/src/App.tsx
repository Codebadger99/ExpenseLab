import Brand from "./assets/Brand mark.png";
import { Button } from "../components/ui/button";

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
          <Button className="bg-[#158260]" size={"lg"}>Get Started</Button>
        </div>
      </div>
    </>
  );
};

export default App;
