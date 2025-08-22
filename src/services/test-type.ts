import type { AvailableSlot } from "./availability.service";

// Test type correctness
const testSlot: AvailableSlot = {
	availabilityId: "test",
	availableDate: "2024-01-01",
	startTime: "09:00",
	endTime: "10:00",
	doctorId: "doctor1",
	doctorName: "Dr. Test"
};

console.log("Type validation successful:", testSlot.startTime, testSlot.endTime);
