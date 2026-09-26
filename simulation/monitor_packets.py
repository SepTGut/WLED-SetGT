import time
import os
import struct

PCAP_PATH = os.path.join(os.path.dirname(__file__), 'wokwi.pcap')

def monitor():
    print("=======================================================")
    print("Wokwi Real-Time Network & Packet Monitor Active")
    print("=======================================================")
    print(f"Monitoring capture file: {PCAP_PATH}")
    
    last_size = 0
    last_count = 0

    while True:
        if os.path.exists(PCAP_PATH):
            current_size = os.path.getsize(PCAP_PATH)
            if current_size != last_size:
                last_size = current_size
                try:
                    with open(PCAP_PATH, 'rb') as f:
                        hdr = f.read(24)
                        pkt_num = 0
                        while True:
                            phdr = f.read(16)
                            if len(phdr) < 16: break
                            ts_sec, ts_usec, incl_len, _ = struct.unpack('<IIII', phdr)
                            f.seek(incl_len, 1)
                            pkt_num += 1
                        
                        if pkt_num > last_count:
                            new_pkts = pkt_num - last_count
                            last_count = pkt_num
                            print(f"[NET UPDATE] Total Packets: {pkt_num} (+{new_pkts} new frames captured)")
                except Exception as e:
                    pass
        time.sleep(2)

if __name__ == '__main__':
    monitor()
