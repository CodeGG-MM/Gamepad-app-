import asyncio
    import websockets
    import json
    import subprocess
    import os
    import socket
    import qrcode
    from zeroconf import ServiceInfo, Zeroconf
    import netifaces as ni
    import logging
    import traceback

    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    class GamepadServer:
        def __init__(self):
            self.connected_clients = set()
            self.key_mapping = {
                'DPAD_UP': 'KEYCODE_DPAD_UP',
                'DPAD_DOWN': 'KEYCODE_DPAD_DOWN',
                'DPAD_LEFT': 'KEYCODE_DPAD_LEFT',
                'DPAD_RIGHT': 'KEYCODE_DPAD_RIGHT',
                'BUTTON_A': 'KEYCODE_BUTTON_A',
                'BUTTON_B': 'KEYCODE_BUTTON_B',
                'BUTTON_X': 'KEYCODE_BUTTON_X',
                'BUTTON_Y': 'KEYCODE_BUTTON_Y',
                'SELECT': 'KEYCODE_BUTTON_SELECT',
                'START': 'KEYCODE_BUTTON_START'
            }
            self.zeroconf = None
            self.local_ip = self.get_local_ip()
            self.server_port = 8000

        def get_local_ip(self):
            try:
                interfaces = ni.interfaces()
                for interface in interfaces:
                    if interface.startswith('lo'):
                        continue
                    addrs = ni.ifaddresses(interface)
                    if ni.AF_INET in addrs:
                        for addr in addrs[ni.AF_INET]:
                            ip = addr['addr']
                            if ip.startswith('192.168.') or ip.startswith('10.') or ip.startswith('172.'):
                                return ip
            except Exception as e:
                logging.error(f"Error getting local IP: {e}")
            return '127.0.0.1'

        def register_mdns_service(self):
            try:
                self.zeroconf = Zeroconf()
                service_info = ServiceInfo(
                    "_gamepad._tcp.local.",
                    "Virtual Gamepad._gamepad._tcp.local.",
                    addresses=[socket.inet_aton(self.local_ip)],
                    port=self.server_port,
                    properties={'path': '/'}
                )
                self.zeroconf.register_service(service_info)
                logging.info(f"mDNS service registered on {self.local_ip}:{self.server_port}")
            except Exception as e:
                logging.error(f"Error registering mDNS service: {e}")

        def generate_qr_code(self):
            try:
                connection_url = f"ws://{self.local_ip}:{self.server_port}"
                qr = qrcode.QRCode(version=1, box_size=10, border=5)
                qr.add_data(connection_url)
                qr.make(fit=True)
                qr.make_image().save('connection_qr.png')
                logging.info(f"QR Code generated for {connection_url}")
                logging.info("Scan the QR code with your mobile device to connect")
            except Exception as e:
                logging.error(f"Error generating QR code: {e}")

        def try_adb_connect(self):
            try:
                result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
                if 'unauthorized' not in result.stdout and 'device' in result.stdout:
                    logging.info("Android TV device found!")
                    return True
                
                common_ports = ['5555', '5037']
                for port in common_ports:
                    try:
                        subprocess.run(['adb', 'connect', f'{self.local_ip}:{port}'], check=True)
                        logging.info(f"Successfully connected to Android TV at {self.local_ip}:{port}")
                        return True
                    except subprocess.CalledProcessError:
                        continue
                
                logging.info("No Android TV devices found automatically. Please enable ADB debugging on your TV")
                logging.info("and connect manually using: adb connect <TV_IP>:5555")
                return False
            except FileNotFoundError:
                logging.error("ADB not found. Please install Android Debug Bridge")
                return False
            except Exception as e:
                logging.error(f"Error during ADB connection attempt: {e}")
                return False

        async def handle_client(self, websocket):
            try:
                self.connected_clients.add(websocket)
                logging.info(f"Client connected. Total clients: {len(self.connected_clients)}")
                
                async for message in websocket:
                    try:
                        data = json.loads(message)
                        command = data.get('command')
                        if command and command in self.key_mapping:
                            android_key = self.key_mapping[command]
                            self.send_key_to_tv(android_key)
                            logging.info(f"Sent {android_key} to Android TV")
                        else:
                            logging.warning(f"Invalid command received: {command}")
                    except json.JSONDecodeError:
                        logging.warning(f"Invalid JSON received: {message}")
                    except Exception as e:
                        logging.error(f"Error processing message: {e}")
                        logging.error(traceback.format_exc())

            except Exception as e:
                logging.error(f"Error handling client: {e}")
                logging.error(traceback.format_exc())
            finally:
                self.connected_clients.remove(websocket)
                logging.info(f"Client disconnected. Total clients: {len(self.connected_clients)}")

        def send_key_to_tv(self, key_code):
            try:
                subprocess.run(['adb', 'shell', f'input keyevent {key_code}'], check=True)
            except subprocess.CalledProcessError as e:
                logging.error(f"Error sending key to TV: {e}")
            except FileNotFoundError:
                logging.error("ADB not found. Please install Android Debug Bridge")
            except Exception as e:
                logging.error(f"Error sending key to TV: {e}")
                logging.error(traceback.format_exc())

        def cleanup(self):
            if self.zeroconf:
                self.zeroconf.close()
            logging.info("Server cleanup completed.")

    async def main():
        server = GamepadServer()
        
        # Try to connect to Android TV
        server.try_adb_connect()
        
        # Register mDNS service for discovery
        server.register_mdns_service()
        
        # Generate QR code for easy connection
        server.generate_qr_code()
        
        try:
            async with websockets.serve(server.handle_client, "0.0.0.0", server.server_port):
                logging.info(f"Gamepad server started on ws://{server.local_ip}:{server.server_port}")
                await asyncio.Future()  # run forever
        except Exception as e:
            logging.error(f"Server encountered an error: {e}")
            logging.error(traceback.format_exc())
        finally:
            server.cleanup()

    if __name__ == "__main__":
        asyncio.run(main())
