import { useWhatsapp } from "@/context/WhatsappContext";
import { Input, Modal } from "antd";

const CustomModal = ({
  isModalOpen,
  setIsModalOpen,
  props,
}: {
  isModalOpen: boolean;
  setIsModalOpen: Function;
  props: any;
}) => {
  const { deviceName = "", setdeviceName = () => {} } = props || {};
  const { loading } = useWhatsapp();

  const handleOk = async () => {
    try {
      const QR_data = await props?.startSession(deviceName);
      if(!QR_data) {
        setIsModalOpen(false)
        return;
      }
      props?.countDown(QR_data);
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <img src="/assets/whatsapp.png" alt="whatsapp" className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Connect WhatsApp Device
            </h3>
            <p className="text-sm text-gray-500">Add a new device to your account</p>
          </div>
        </div>
      }
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={loading ? "Connecting..." : "Connect Device"}
      okButtonProps={{ 
        disabled: loading,
        className: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none shadow-sm hover:shadow-md transition-all duration-300"
      }}
      cancelButtonProps={{
        className: "hover:bg-gray-100 transition-all duration-300"
      }}
      width={450}
      maskClosable={false}
      className="custom-modal"
      maskStyle={{
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0, 0, 0, 0.25)"
      }}
    >
      <div className="py-6">
        <div className="space-y-4">
          <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-gray-600">
              Enter a name for your WhatsApp device to help you identify it later. This name will be displayed in your dashboard.
            </p>
          </div>
          <div className="relative">
            <Input
              placeholder="e.g., My Business Phone"
              onChange={(e) => setdeviceName(e.target.value)}
              value={deviceName}
              className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
              size="large"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg pointer-events-none"></div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CustomModal;
