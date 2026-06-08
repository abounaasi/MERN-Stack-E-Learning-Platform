import TryCatch from "../middlewares/TryCatch.js";
import { StudyGroup } from "../models/StudyGroup.js";
import { Message } from "../models/Message.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";

// members may be raw ObjectIds or populated user docs — handle both
const isMember = (group, userId) =>
  group.members.some(
    (m) => (m._id ? m._id : m).toString() === userId.toString(),
  );

export const createGroup = TryCatch(async (req, res) => {
  const { name, courseId } = req.body;

  const course = await Courses.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  // the creator must be enrolled in the course
  const enrolled = req.user.subscription.some(
    (id) => id.toString() === courseId.toString(),
  );
  if (!enrolled)
    return res.status(403).json({
      message: "You must be enrolled in this course to create a group",
    });

  const group = await StudyGroup.create({
    name,
    course: courseId,
    owner: req.user._id,
    members: [req.user._id],
  });

  res.status(201).json({ message: "Study group created", group });
});

export const getMyGroups = TryCatch(async (req, res) => {
  const groups = await StudyGroup.find({ members: req.user._id })
    .populate("course", "title")
    .sort({ updatedAt: -1 });

  res.json({ groups });
});

export const getGroup = TryCatch(async (req, res) => {
  const group = await StudyGroup.findById(req.params.id)
    .populate("course", "title")
    .populate("members", "name email")
    .populate("owner", "name email");

  if (!group) return res.status(404).json({ message: "Group not found" });

  if (!isMember(group, req.user._id))
    return res.status(403).json({ message: "You are not in this group" });

  res.json({ group });
});

export const getGroupMessages = TryCatch(async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);

  if (!group) return res.status(404).json({ message: "Group not found" });

  if (!isMember(group, req.user._id))
    return res.status(403).json({ message: "You are not in this group" });

  const messages = await Message.find({ group: group._id }).sort({
    createdAt: 1,
  });

  res.json({ messages });
});

export const inviteMember = TryCatch(async (req, res) => {
  const { email } = req.body;

  const group = await StudyGroup.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (!isMember(group, req.user._id))
    return res.status(403).json({ message: "You are not in this group" });

  const invited = await User.findOne({ email });
  if (!invited)
    return res.status(404).json({ message: "No user with this email" });

  if (isMember(group, invited._id))
    return res.status(409).json({ message: "User is already in this group" });

  group.members.push(invited._id);
  await group.save();

  res.json({ message: `${invited.name} was added to the group` });
});

export const updateNotes = TryCatch(async (req, res) => {
  const { notes } = req.body;

  const group = await StudyGroup.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (!isMember(group, req.user._id))
    return res.status(403).json({ message: "You are not in this group" });

  group.notes = notes;
  await group.save();

  // let other members see the update live
  const io = req.app.get("io");
  if (io) {
    io.to(group._id.toString()).emit("notesUpdated", {
      notes,
      by: req.user.name,
    });
  }

  res.json({ message: "Notes saved" });
});

export const leaveGroup = TryCatch(async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (!isMember(group, req.user._id))
    return res.status(403).json({ message: "You are not in this group" });

  group.members = group.members.filter(
    (m) => m.toString() !== req.user._id.toString(),
  );

  // clean up an empty group and its messages
  if (group.members.length === 0) {
    await Message.deleteMany({ group: group._id });
    await group.deleteOne();
    return res.json({ message: "You left the group" });
  }

  await group.save();
  res.json({ message: "You left the group" });
});
