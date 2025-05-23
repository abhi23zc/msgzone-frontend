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
        return ;
      }
      //   console.log("QR_Data>> ", QR_data);
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
    <>
      <Modal
        title="📱 Please Enter Device Name"
        closable={{ "aria-label": "Custom Close Button" }}
        width={400}
        open={isModalOpen}
        onOk={handleOk}
        okText={loading ? "Please wait" : "Start"}
        okButtonProps={{ disabled: loading }}
        onCancel={handleCancel}
      >
        <Input
          placeholder="Enter Device name"
          onChange={(e) => setdeviceName(e.target.value)}
          value={deviceName}
        />
      </Modal>
    </>
  );
};

export default CustomModal;
