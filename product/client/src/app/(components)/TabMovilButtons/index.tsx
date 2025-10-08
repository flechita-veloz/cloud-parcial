import { Button } from "@/components/ui/button";

type TabType = "products" | "payment";

type TabMovilButtonsProps = {
  textBtn1: string;
  textBtn2: string;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
};

const TabMovilButtons = ({
  textBtn1,
  textBtn2,
  activeTab,
  setActiveTab,
}: TabMovilButtonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:hidden">
      <Button
        className="w-full text-lg font-bold"
        variant={activeTab === "products" ? "confirmAction" : "editAction"}
        onClick={() => setActiveTab("products")}
      >
        {textBtn1}
      </Button>
      <Button
        className="w-full text-lg font-bold"
        variant={activeTab === "payment" ? "confirmAction" : "editAction"}
        onClick={() => setActiveTab("payment")}
      >
        {textBtn2}
      </Button>
    </div>
  );
};

export default TabMovilButtons;