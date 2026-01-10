"""
Raspberry Pi system statistics service.
Collects CPU temperature, usage, RAM, and disk metrics.
"""

from gpiozero import CPUTemperature
import psutil
from app.models.schemas import PiStatsResponse


def get_pi_stats() -> PiStatsResponse:
    """
    Collect system statistics for the Raspberry Pi.

    Returns:
        PiStatsResponse: System stats including CPU temp, CPU usage, RAM, and disk
    """
    try:
        cpu = CPUTemperature()
        ram = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        cpu_usage = psutil.cpu_percent(interval=0.1)

        return PiStatsResponse(
            cpu_temp=int(round(cpu.temperature)),
            cpu_usage=cpu_usage,
            ram_usage=ram.percent,
            disk_usage=disk.percent
        )
    except Exception as e:
        print(f"Error getting Pi stats: {e}")
        # Return default values on error
        return PiStatsResponse(
            cpu_temp=0,
            cpu_usage=0.0,
            ram_usage=0.0,
            disk_usage=0.0
        )
