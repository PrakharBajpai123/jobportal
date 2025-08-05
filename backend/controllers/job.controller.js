import { Job } from "../models/job.model.js";

// admin can post a new job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id; // Assuming req.id is set by a middleware

        // Validate that all required fields exist
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            });
        }

        // Validate that the number fields are actually numbers
        // We use Number() to convert the string and isNaN() to check for Not-a-Number
        const parsedSalary = Number(salary);
        const parsedExperience = Number(experience);
        const parsedPosition = Number(position);

        if (isNaN(parsedSalary) || isNaN(parsedExperience) || isNaN(parsedPosition)) {
            return res.status(400).json({
                message: "Salary, experience, and position must be valid numbers.",
                success: false
            });
        }
        
        // Create the job document with the validated and parsed data
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: parsedSalary,
            location,
            jobType,
            experienceLevel: parsedExperience,
            position: parsedPosition,
            company: companyId,
            created_by: userId
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });

    } catch (error) {
        console.error("Error in postJob:", error);
        return res.status(500).json({
            message: "An internal server error occurred.",
            success: false,
            error: error.message
        });
    }
};

// student can get all jobs
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found.",
                success: false
            });
        }
        
        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.error("Error in getAllJobs:", error);
        return res.status(500).json({
            message: "An internal server error occurred.",
            success: false,
            error: error.message
        });
    }
};

// student can get a job by ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }
        
        return res.status(200).json({ job, success: true });

    } catch (error) {
        console.error("Error in getJobById:", error);
        return res.status(500).json({
            message: "An internal server error occurred.",
            success: false,
            error: error.message
        });
    }
};

// admin can get jobs they've created
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company'
        }).sort({ createdAt:-1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }
        
        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.error("Error in getAdminJobs:", error);
        return res.status(500).json({
            message: "An internal server error occurred.",
            success: false,
            error: error.message
        });
    }
};