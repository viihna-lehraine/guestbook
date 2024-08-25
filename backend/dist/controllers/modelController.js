import setupLogger from '../config/logger.js';
const logger = setupLogger();
// Retrieve all entries for any model
export const getEntries = Model => async (req, res) => {
	try {
		const entries = await Model.findAll();
		res.status(200).json(entries);
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			error: `Failed to fetch entries from ${Model.name}`
		});
	}
};
// Create a new entry for any model
export const createEntry = Model => async (req, res) => {
	try {
		const newEntry = await Model.create(req.body);
		res.status(201).json(newEntry);
	} catch (error) {
		logger.error(error);
		res.status(400).json({
			error: `Failed to create entry in ${Model.name}`
		});
	}
};
// Update an existing entry for any model
export const updateEntry = Model => async (req, res) => {
	try {
		const { id } = req.params;
		const updatedEntry = await Model.update(req.body, {
			where: { id }
		});
		if (updatedEntry[0] === 0) {
			res.status(404).json({
				error: `${Model.name} entry not found`
			});
			return;
		}
		res.status(200).json({ message: `${Model.name} entry updated` });
	} catch (error) {
		logger.error(error);
		res.status(400).json({
			error: `Failed to update entry in ${Model.name}`
		});
	}
};
// Delete an entry for any model
export const deleteEntry = Model => async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Model.destroy({
			where: { id }
		});
		if (!deleted) {
			res.status(404).json({
				error: `${Model.name} entry not found`
			});
			return;
		}
		res.status(200).json({ message: `${Model.name} entry deleted` });
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			error: `Failed to delete entry from ${Model.name}`
		});
	}
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXJzL21vZGVsQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLFdBQVcsTUFBTSxrQkFBa0IsQ0FBQztBQU8zQyxNQUFNLE1BQU0sR0FBRyxXQUFXLEVBQUUsQ0FBQztBQUU3QixxQ0FBcUM7QUFDckMsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUN0QixDQUFzQixLQUdyQixFQUFvRCxFQUFFLENBQ3ZELEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBYSxFQUFpQixFQUFFO0lBQ3BELElBQUksQ0FBQztRQUNKLE1BQU0sT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDcEIsS0FBSyxFQUFFLGdDQUFnQyxLQUFLLENBQUMsSUFBSSxFQUFFO1NBQ25ELENBQUMsQ0FBQztJQUNKLENBQUM7QUFDRixDQUFDLENBQUM7QUFFSCxtQ0FBbUM7QUFDbkMsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUN2QixDQUFzQixLQUdyQixFQUFvRCxFQUFFLENBQ3ZELEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBYSxFQUFpQixFQUFFO0lBQ3BELElBQUksQ0FBQztRQUNKLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENB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ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgTW9kZWwsIFdoZXJlT3B0aW9ucyB9IGZyb20gJ3NlcXVlbGl6ZSc7XG5pbXBvcnQgc2V0dXBMb2dnZXIgZnJvbSAnLi4vY29uZmlnL2xvZ2dlcic7XG5cbi8vIERlZmluZSBhIGdlbmVyaWMgdHlwZSBmb3IgbW9kZWxzXG5pbnRlcmZhY2UgTW9kZWxUeXBlIGV4dGVuZHMgTW9kZWwge1xuXHRpZD86IG51bWJlciB8IHN0cmluZztcbn1cblxuY29uc3QgbG9nZ2VyID0gc2V0dXBMb2dnZXIoKTtcblxuLy8gUmV0cmlldmUgYWxsIGVudHJpZXMgZm9yIGFueSBtb2RlbFxuZXhwb3J0IGNvbnN0IGdldEVudHJpZXMgPVxuXHQ8VCBleHRlbmRzIE1vZGVsVHlwZT4oTW9kZWw6IHtcblx0XHRuZXcgKCk6IFQ7XG5cdFx0ZmluZEFsbDogKCkgPT4gUHJvbWlzZTxUW10+O1xuXHR9KTogKChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpID0+IFByb21pc2U8dm9pZD4pID0+XG5cdGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZW50cmllcyA9IGF3YWl0IE1vZGVsLmZpbmRBbGwoKTtcblx0XHRcdHJlcy5zdGF0dXMoMjAwKS5qc29uKGVudHJpZXMpO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRsb2dnZXIuZXJyb3IoZXJyb3IpO1xuXHRcdFx0cmVzLnN0YXR1cyg1MDApLmpzb24oe1xuXHRcdFx0XHRlcnJvcjogYEZhaWxlZCB0byBmZXRjaCBlbnRyaWVzIGZyb20gJHtNb2RlbC5uYW1lfWBcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblxuLy8gQ3JlYXRlIGEgbmV3IGVudHJ5IGZvciBhbnkgbW9kZWxcbmV4cG9ydCBjb25zdCBjcmVhdGVFbnRyeSA9XG5cdDxUIGV4dGVuZHMgTW9kZWxUeXBlPihNb2RlbDoge1xuXHRcdG5ldyAoKTogVDtcblx0XHRjcmVhdGU6ICh2YWx1ZXM6IG9iamVjdCkgPT4gUHJvbWlzZTxUPjtcblx0fSk6ICgocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiBQcm9taXNlPHZvaWQ+KSA9PlxuXHRhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG5ld0VudHJ5ID0gYXdhaXQgTW9kZWwuY3JlYXRlKHJlcS5ib2R5KTtcblx0XHRcdHJlcy5zdGF0dXMoMjAxKS5qc29uKG5ld0VudHJ5KTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0bG9nZ2VyLmVycm9yKGVycm9yKTtcblx0XHRcdHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcblx0XHRcdFx0ZXJyb3I6IGBGYWlsZWQgdG8gY3JlYXRlIGVudHJ5IGluICR7TW9kZWwubmFtZX1gXG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cbi8vIFVwZGF0ZSBhbiBleGlzdGluZyBlbnRyeSBmb3IgYW55IG1vZGVsXG5leHBvcnQgY29uc3QgdXBkYXRlRW50cnkgPVxuXHQ8VCBleHRlbmRzIE1vZGVsVHlwZT4oTW9kZWw6IHtcblx0XHRuZXcgKCk6IFQ7XG5cdFx0dXBkYXRlOiAoXG5cdFx0XHR2YWx1ZXM6IG9iamVjdCxcblx0XHRcdG9wdGlvbnM6IHsgd2hlcmU6IFdoZXJlT3B0aW9uczxUPiB9XG5cdFx0KSA9PiBQcm9taXNlPFtudW1iZXIsIFRbXV0+O1xuXHR9KTogKChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpID0+IFByb21pc2U8dm9pZD4pID0+XG5cdGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcblx0XHRcdGNvbnN0IHVwZGF0ZWRFbnRyeSA9IGF3YWl0IE1vZGVsLnVwZGF0ZShyZXEuYm9keSwge1xuXHRcdFx0XHR3aGVyZTogeyBpZCB9IGFzIFdoZXJlT3B0aW9uczxUPlxuXHRcdFx0fSk7XG5cdFx0XHRpZiAodXBkYXRlZEVudHJ5WzBdID09PSAwKSB7XG5cdFx0XHRcdHJlcy5zdGF0dXMoNDA0KS5qc29uKHtcblx0XHRcdFx0XHRlcnJvcjogYCR7TW9kZWwubmFtZX0gZW50cnkgbm90IGZvdW5kYFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0cmVzLnN0YXR1cygyMDApLmpzb24oeyBtZXNzYWdlOiBgJHtNb2RlbC5uYW1lfSBlbnRyeSB1cGRhdGVkYCB9KTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0bG9nZ2VyLmVycm9yKGVycm9yKTtcblx0XHRcdHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcblx0XHRcdFx0ZXJyb3I6IGBGYWlsZWQgdG8gdXBkYXRlIGVudHJ5IGluICR7TW9kZWwubmFtZX1gXG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cbi8vIERlbGV0ZSBhbiBlbnRyeSBmb3IgYW55IG1vZGVsXG5leHBvcnQgY29uc3QgZGVsZXRlRW50cnkgPVxuXHQ8VCBleHRlbmRzIE1vZGVsVHlwZT4oTW9kZWw6IHtcblx0XHRuZXcgKCk6IFQ7XG5cdFx0ZGVzdHJveTogKG9wdGlvbnM6IHsgd2hlcmU6IFdoZXJlT3B0aW9uczxUPiB9KSA9PiBQcm9taXNlPG51bWJlcj47XG5cdH0pOiAoKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4gUHJvbWlzZTx2b2lkPikgPT5cblx0YXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSk6IFByb21pc2U8dm9pZD4gPT4ge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuXHRcdFx0Y29uc3QgZGVsZXRlZCA9IGF3YWl0IE1vZGVsLmRlc3Ryb3koe1xuXHRcdFx0XHR3aGVyZTogeyBpZCB9IGFzIFdoZXJlT3B0aW9uczxUPlxuXHRcdFx0fSk7XG5cdFx0XHRpZiAoIWRlbGV0ZWQpIHtcblx0XHRcdFx0cmVzLnN0YXR1cyg0MDQpLmpzb24oe1xuXHRcdFx0XHRcdGVycm9yOiBgJHtNb2RlbC5uYW1lfSBlbnRyeSBub3QgZm91bmRgXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRyZXMuc3RhdHVzKDIwMCkuanNvbih7IG1lc3NhZ2U6IGAke01vZGVsLm5hbWV9IGVudHJ5IGRlbGV0ZWRgIH0pO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRsb2dnZXIuZXJyb3IoZXJyb3IpO1xuXHRcdFx0cmVzLnN0YXR1cyg1MDApLmpzb24oe1xuXHRcdFx0XHRlcnJvcjogYEZhaWxlZCB0byBkZWxldGUgZW50cnkgZnJvbSAke01vZGVsLm5hbWV9YFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xuIl19
