from typing import Any
import math

class NetworkFeatureExtractor:
    """Extracts numerical features from network flow records."""
    
    @staticmethod
    def extract(payload_data: dict[str, Any]) -> dict[str, float]:
        bytes_sent = float(payload_data.get("bytes_sent", 0))
        bytes_received = float(payload_data.get("bytes_recv", 0))
        packets_sent = float(payload_data.get("packets_sent", 1))
        packets_received = float(payload_data.get("packets_recv", 1))
        duration = float(payload_data.get("duration", 0.001))
        dst_port = int(payload_data.get("dst_port", 80))
        
        total_bytes = bytes_sent + bytes_received
        total_packets = packets_sent + packets_received
        bytes_per_second = total_bytes / max(duration, 0.001)
        packets_per_second = total_packets / max(duration, 0.001)
        byte_ratio = bytes_sent / max(bytes_received, 1.0)
        
        # Check suspicious / non-standard ports
        is_suspicious_port = 1.0 if dst_port not in [80, 443, 53, 22] else 0.0
        
        # Calculate entropy of destination port number string
        port_str = str(dst_port)
        entropy = 0.0
        for char in set(port_str):
            p = port_str.count(char) / len(port_str)
            entropy -= p * math.log2(p)
            
        return {
            "total_bytes": total_bytes,
            "total_packets": total_packets,
            "duration": duration,
            "bytes_per_second": bytes_per_second,
            "packets_per_second": packets_per_second,
            "byte_ratio": byte_ratio,
            "dst_port": float(dst_port),
            "is_suspicious_port": is_suspicious_port,
            "port_entropy": round(entropy, 4)
        }
