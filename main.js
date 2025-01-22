class GamepadController {
      constructor() {
        this.socket = null;
        this.serverAddress = '';
        this.isCustomizing = false;
        this.selectedElement = null;
        this.setupEventListeners();
        this.setupJoysticks();
      }

      setupEventListeners() {
        // D-pad buttons
        ['up', 'down', 'left', 'right'].forEach(direction => {
          const button = document.getElementById(direction);
          button.addEventListener('touchstart', () => this.sendCommand(`DPAD_${direction.toUpperCase()}`));
          button.addEventListener('mousedown', () => this.sendCommand(`DPAD_${direction.toUpperCase()}`));
        });

        // Action buttons
        ['a', 'b', 'x', 'y'].forEach(button => {
          const elem = document.getElementById(button);
          elem.addEventListener('touchstart', () => this.sendCommand(`BUTTON_${button.toUpperCase()}`));
          elem.addEventListener('mousedown', () => this.sendCommand(`BUTTON_${button.toUpperCase()}`));
        });

        // Menu buttons
        ['select', 'start'].forEach(button => {
          const elem = document.getElementById(button);
          elem.addEventListener('touchstart', () => this.sendCommand(button.toUpperCase()));
          elem.addEventListener('mousedown', () => this.sendCommand(button.toUpperCase()));
        });

        // Shoulder buttons
        ['l1', 'r1', 'l2', 'r2'].forEach(button => {
          const elem = document.getElementById(button);
           elem.addEventListener('touchstart', () => this.sendCommand(button.toUpperCase()));
          elem.addEventListener('mousedown', () => this.sendCommand(button.toUpperCase()));
        });

        // Settings button
        document.getElementById('settings').addEventListener('click', () => this.showSettings());

        // Customize controls button
        document.getElementById('customize-controls').addEventListener('click', () => this.toggleCustomizeMode());
      }

      setupJoysticks() {
        this.movementJoystick = document.getElementById('movement-joystick');
        this.cameraJoystick = document.getElementById('camera-joystick');
        this.movementHandle = this.movementJoystick.querySelector('.joystick-handle');
        this.cameraHandle = this.cameraJoystick.querySelector('.joystick-handle');

        this.movementJoystick.addEventListener('touchstart', (e) => this.handleJoystickStart(e, this.movementJoystick, this.movementHandle, 'movement'));
        this.movementJoystick.addEventListener('mousedown', (e) => this.handleJoystickStart(e, this.movementJoystick, this.movementHandle, 'movement'));
        this.cameraJoystick.addEventListener('touchstart', (e) => this.handleJoystickStart(e, this.cameraJoystick, this.cameraHandle, 'camera'));
        this.cameraJoystick.addEventListener('mousedown', (e) => this.handleJoystickStart(e, this.cameraJoystick, this.cameraHandle, 'camera'));

        document.addEventListener('touchmove', (e) => this.handleJoystickMove(e));
        document.addEventListener('mousemove', (e) => this.handleJoystickMove(e));
        document.addEventListener('touchend', () => this.handleJoystickEnd());
        document.addEventListener('mouseup', () => this.handleJoystickEnd());
      }

      handleJoystickStart(event, joystick, handle, type) {
        event.preventDefault();
        this.activeJoystick = { joystick, handle, type };
        this.handleJoystickMove(event);
      }

      handleJoystickMove(event) {
        if (!this.activeJoystick) return;

        const joystick = this.activeJoystick.joystick;
        const handle = this.activeJoystick.handle;
        const type = this.activeJoystick.type;

        const rect = joystick.getBoundingClientRect();
        const touch = event.touches ? event.touches[0] : event;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = rect.width / 2;

        const normalizedX = Math.min(1, Math.max(-1, deltaX / maxDistance));
        const normalizedY = Math.min(1, Math.max(-1, deltaY / maxDistance));

        const handleX = centerX + (normalizedX * maxDistance * 0.8);
        const handleY = centerY + (normalizedY * maxDistance * 0.8);

        handle.style.left = `${handleX}px`;
        handle.style.top = `${handleY}px`;

        this.sendCommand(`${type.toUpperCase()}_JOYSTICK_${normalizedX.toFixed(2)}_${normalizedY.toFixed(2)}`);
      }

      handleJoystickEnd() {
        if (!this.activeJoystick) return;
        const handle = this.activeJoystick.handle;
        handle.style.left = '50%';
        handle.style.top = '50%';
        this.activeJoystick = null;
      }

      toggleCustomizeMode() {
        this.isCustomizing = !this.isCustomizing;
        const buttons = document.querySelectorAll('.dpad-button, .action-button, .shoulder-button, .joystick-container, .menu-button');
        buttons.forEach(button => {
          if (this.isCustomizing) {
            button.classList.add('customizable');
            button.addEventListener('mousedown', (e) => this.selectElement(e, button));
            button.addEventListener('touchstart', (e) => this.selectElement(e, button));
          } else {
            button.classList.remove('customizable');
            button.removeEventListener('mousedown', (e) => this.selectElement(e, button));
            button.removeEventListener('touchstart', (e) => this.selectElement(e, button));
          }
        });
      }

      selectElement(event, element) {
        event.preventDefault();
        if (this.selectedElement) {
          this.selectedElement.classList.remove('selected');
        }
        this.selectedElement = element;
        this.selectedElement.classList.add('selected');
        this.setupDragAndResize(element);
      }

      setupDragAndResize(element) {
        // This is where you would implement the drag and resize logic
        // For example, you could use event listeners for mousemove/touchmove
        // to update the position and size of the selected element.
        // This would involve calculating the deltas and updating the element's
        // style properties (e.g., top, left, width, height).
        // Due to the limitations of this environment, I will not implement
        // the full drag and resize functionality.
        console.log('Implement drag and resize logic here for:', element);
      }

      showSettings() {
        const address = prompt('Enter server address:', this.serverAddress);
        if (address) {
          this.serverAddress = address;
          this.connect();
        }
      }

      connect() {
        try {
          if (this.socket) {
            this.socket.close();
          }

          this.socket = new WebSocket(`ws://${this.serverAddress}:8000`);
          
          this.socket.onopen = () => {
            this.updateStatus('Connected');
          };

          this.socket.onclose = () => {
            this.updateStatus('Disconnected');
          };

          this.socket.onerror = () => {
            this.updateStatus('Connection Error');
          };
        } catch (error) {
          console.error('Connection error:', error);
          this.updateStatus('Connection Error');
        }
      }

      sendCommand(command) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ command }));
        }
      }

      updateStatus(status) {
        document.getElementById('connection-status').textContent = status;
      }
    }

    // Initialize the controller
    new GamepadController();
