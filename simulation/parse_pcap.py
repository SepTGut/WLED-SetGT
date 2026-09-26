import struct
import socket

def parse_pcap(filepath):
    print("=======================================================")
    print(f"Analyzing Network Packet Capture: {filepath}")
    print("=======================================================")

    with open(filepath, 'rb') as f:
        global_header = f.read(24)
        if len(global_header) < 24:
            print("Invalid or empty PCAP file.")
            return

        magic, ver_maj, ver_min, tz, flags, snaplen, linktype = struct.unpack('<IHHiIII', global_header)
        print(f"PCAP Header: LinkType={linktype} (105=IEEE 802.11 Wireless), SnapLen={snaplen}")
        print("-------------------------------------------------------")

        packet_count = 0
        frame_types = {}
        mac_addrs = set()
        ssids = set()
        sample_packets = []

        while True:
            hdr = f.read(16)
            if len(hdr) < 16:
                break
            
            ts_sec, ts_usec, incl_len, orig_len = struct.unpack('<IIII', hdr)
            pkt_data = f.read(incl_len)
            packet_count += 1

            if linktype == 105 or linktype == 127: # IEEE 802.11 Wireless
                if len(pkt_data) >= 24:
                    # 802.11 Frame Control (2 bytes)
                    fc = struct.unpack('<H', pkt_data[0:2])[0]
                    type_sub = (fc >> 2) & 0x3F
                    f_type = (fc >> 2) & 0x03
                    f_subtype = (fc >> 4) & 0x0F

                    type_name = "Management" if f_type == 0 else ("Control" if f_type == 1 else ("Data" if f_type == 2 else "Extension"))
                    frame_types[type_name] = frame_types.get(type_name, 0) + 1

                    # Extract MAC addresses
                    if len(pkt_data) >= 24:
                        addr1 = ":".join(f"{b:02X}" for b in pkt_data[4:10])
                        addr2 = ":".join(f"{b:02X}" for b in pkt_data[10:16])
                        mac_addrs.add(addr1)
                        mac_addrs.add(addr2)

                    # Beacon frame (Type 0, Subtype 8) -> extract SSID
                    if f_type == 0 and f_subtype == 8 and len(pkt_data) > 38:
                        ssid_len = pkt_data[37]
                        if len(pkt_data) >= 38 + ssid_len:
                            ssid_bytes = pkt_data[38:38+ssid_len]
                            try:
                                ssid_name = ssid_bytes.decode('utf-8', errors='ignore')
                                if ssid_name: ssids.add(ssid_name)
                            except: pass

                    # Extract IP if encapsulated inside 802.11 Data Frame (LLC/SNAP header)
                    info = f"{type_name} frame (Subtype {f_subtype})"
                    if f_type == 2: # Data
                        # Check for IP inside LLC SNAP (0xAA 0xAA 0x03)
                        if b'\xaa\xaa\x03\x00\x00\x00\x08\x00' in pkt_data:
                            info = "802.11 Data (IPv4 Packet)"
                        elif b'Wokwi' in pkt_data or b'WLED' in pkt_data:
                            info = "802.11 Data (WLED/Wokwi Payload)"

                    if len(sample_packets) < 20:
                        sample_packets.append(f"Pkt #{packet_count} [{ts_sec}.{ts_usec:06d}] {addr2} -> {addr1} | {info}")

            elif linktype == 1: # Ethernet
                packet_count += 1

    print("Summary Analysis:")
    print(f"  - Total Packets Captured: {packet_count}")
    print(f"  - Frame Type Breakdown:   {frame_types}")
    print(f"  - Discovered Wi-Fi SSIDs: {list(ssids)}")
    print(f"  - Active MAC Addresses:   {list(mac_addrs)[:5]}")
    print("\nSample Packet Chronology:")
    for sample in sample_packets:
        print(f"  {sample}")

if __name__ == '__main__':
    parse_pcap('D:/MyCode/WLED-SetGT/simulation/wokwi.pcap')
