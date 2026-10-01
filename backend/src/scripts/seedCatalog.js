import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Certification from '../models/Certification.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/nextstep-ai';

export const initialCourses = [
  // --- Java Full Stack ---
  {
    title: 'Spring Boot 3 & Spring Framework Masterclass',
    provider: 'Udemy / in28minutes',
    description: 'Learn Spring Boot, RESTful Web Services, Spring Data JPA, Hibernate, and Spring Security with hands-on projects.',
    skills: ['Java', 'Spring Boot', 'REST API', 'Hibernate', 'Spring Security'],
    targetRoles: ['Java Full Stack Developer', 'Backend Developer', 'Software Engineer'],
    level: 'Intermediate',
    duration: '28 hours',
    category: 'Backend Development',
    prerequisites: ['Java', 'SQL'],
    url: 'https://spring.io/projects/spring-boot',
  },
  {
    title: 'Building Scalable Microservices with Spring Boot & Spring Cloud',
    provider: 'Coursera / Google Cloud',
    description: 'Design and deploy production-grade microservices with Spring Cloud, Docker, Eureka, API Gateway, and resilient architectures.',
    skills: ['Spring Boot', 'Microservices', 'Docker', 'REST API'],
    targetRoles: ['Java Full Stack Developer', 'Backend Developer'],
    level: 'Advanced',
    duration: '35 hours',
    category: 'Backend Development',
    prerequisites: ['Spring Boot', 'Java'],
    url: 'https://coursera.org',
  },
  {
    title: 'Java Persistence: Hibernate and JPA Fundamentals',
    provider: 'Pluralsight',
    description: 'Deep dive into database mapping, ORM concepts, entity relationships, caching, and performance tuning with Hibernate.',
    skills: ['Hibernate', 'JPA', 'SQL', 'Java'],
    targetRoles: ['Java Full Stack Developer', 'Backend Developer'],
    level: 'Intermediate',
    duration: '12 hours',
    category: 'Backend Development',
    prerequisites: ['Java', 'SQL'],
    url: 'https://hibernate.org',
  },

  // --- Frontend Development ---
  {
    title: 'React: The Complete Guide 2026 (incl. Next.js, Redux)',
    provider: 'Academind / Udemy',
    description: 'Master modern React from scratch: Hooks, Router, Redux Toolkit, Next.js, server components, and styling with Tailwind.',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux'],
    targetRoles: ['Frontend Developer', 'Full Stack Developer', 'Java Full Stack Developer'],
    level: 'Beginner',
    duration: '40 hours',
    category: 'Frontend Development',
    prerequisites: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://react.dev',
  },
  {
    title: 'Understanding TypeScript: Fast-Track to Production',
    provider: 'Frontend Masters',
    description: 'Master static typing, generics, decorators, compiler options, and building type-safe applications with TypeScript.',
    skills: ['TypeScript', 'JavaScript'],
    targetRoles: ['Frontend Developer', 'Full Stack Developer'],
    level: 'Intermediate',
    duration: '10 hours',
    category: 'Frontend Development',
    prerequisites: ['JavaScript'],
    url: 'https://www.typescriptlang.org',
  },
  {
    title: 'Advanced CSS and Sass: Flexbox, Grid, Animations and More',
    provider: 'Jonas Schmedtmann',
    description: 'Modern CSS layout techniques including Flexbox, CSS Grid, responsive design, animations, and CSS architecture.',
    skills: ['CSS', 'HTML', 'Responsive Design'],
    targetRoles: ['Frontend Developer', 'UI/UX Designer'],
    level: 'Intermediate',
    duration: '22 hours',
    category: 'Frontend Development',
    prerequisites: ['HTML', 'CSS basics'],
    url: 'https://developer.mozilla.org',
  },

  // --- Data Analytics & Data Science ---
  {
    title: 'The Complete SQL Bootcamp: Go from Zero to Hero',
    provider: 'Udemy / Jose Portilla',
    description: 'Become an expert at SQL: PostgreSQL, complex queries, aggregations, JOINs, window functions, and database design.',
    skills: ['SQL', 'PostgreSQL', 'Database Design'],
    targetRoles: ['Data Analyst', 'Data Scientist', 'Backend Developer'],
    level: 'Beginner',
    duration: '18 hours',
    category: 'Data & Analytics',
    prerequisites: [],
    url: 'https://www.postgresql.org',
  },
  {
    title: 'Python for Data Science and Machine Learning Bootcamp',
    provider: 'Coursera / IBM',
    description: 'Learn Python, NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, and statistical modeling for data science.',
    skills: ['Python', 'Pandas', 'NumPy', 'Data Analysis'],
    targetRoles: ['Data Analyst', 'Data Scientist', 'Machine Learning Engineer'],
    level: 'Beginner',
    duration: '30 hours',
    category: 'Data & Analytics',
    prerequisites: ['Python basics'],
    url: 'https://www.python.org',
  },
  {
    title: 'Business Intelligence with Microsoft Power BI & Tableau',
    provider: 'Maven Analytics',
    description: 'Connect data, create interactive dashboards, compute DAX measures, and present compelling business insights.',
    skills: ['Power BI', 'Tableau', 'Data Visualization', 'Business Intelligence'],
    targetRoles: ['Data Analyst', 'Business Analyst'],
    level: 'Intermediate',
    duration: '20 hours',
    category: 'Data & Analytics',
    prerequisites: ['Excel or SQL'],
    url: 'https://powerbi.microsoft.com',
  },

  // --- Cloud & DevOps ---
  {
    title: 'Docker & Kubernetes: The Practical Guide',
    provider: 'Academind',
    description: 'Learn Docker containerization, images, volumes, networks, compose, and Kubernetes deployments, services, and ingress.',
    skills: ['Docker', 'Kubernetes', 'DevOps', 'Containers'],
    targetRoles: ['DevOps Engineer', 'Cloud Engineer', 'Backend Developer', 'Java Full Stack Developer'],
    level: 'Intermediate',
    duration: '24 hours',
    category: 'Cloud & DevOps',
    prerequisites: ['Linux basics'],
    url: 'https://www.docker.com',
  },
  {
    title: 'AWS Certified Cloud Practitioner Ultimate Training',
    provider: 'Stephane Maarek / Udemy',
    description: 'Comprehensive AWS cloud computing fundamentals: EC2, S3, IAM, VPC, Lambda, RDS, security, pricing, and architectures.',
    skills: ['AWS', 'Cloud Computing', 'IAM', 'EC2', 'S3'],
    targetRoles: ['Cloud Engineer', 'DevOps Engineer', 'Software Engineer'],
    level: 'Beginner',
    duration: '16 hours',
    category: 'Cloud & DevOps',
    prerequisites: [],
    url: 'https://aws.amazon.com',
  },
  {
    title: 'Automated CI/CD Pipelines with GitHub Actions',
    provider: 'GitHub Learning Lab',
    description: 'Automate build, test, and deployment workflows using GitHub Actions, custom runners, and automated security scanning.',
    skills: ['CI/CD', 'GitHub Actions', 'DevOps', 'Automation'],
    targetRoles: ['DevOps Engineer', 'Full Stack Developer', 'Cloud Engineer'],
    level: 'Intermediate',
    duration: '8 hours',
    category: 'Cloud & DevOps',
    prerequisites: ['Git'],
    url: 'https://github.com/features/actions',
  },
];

export const initialCertifications = [
  {
    name: 'Oracle Certified Professional: Java SE 17 Developer',
    provider: 'Oracle Corporation',
    description: 'Industry standard certification validating profound understanding of Java language features, concurrency, streams, and OOP.',
    skills: ['Java', 'Object Oriented Programming', 'Concurrency', 'Streams API'],
    targetRoles: ['Java Full Stack Developer', 'Backend Developer', 'Software Engineer'],
    level: 'Advanced',
    prerequisites: ['Solid Java core programming experience'],
    officialUrl: 'https://education.oracle.com/java-se-17-developer',
    preparationTime: '2-3 months',
    cost: '$245 USD',
    category: 'Software Engineering',
  },
  {
    name: 'Meta Front-End Developer Professional Certificate',
    provider: 'Meta / Coursera',
    description: 'Nine-course program by Meta engineers teaching responsive web design, JavaScript, React, version control, and frontend architecture.',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'UI/UX', 'Version Control'],
    targetRoles: ['Frontend Developer', 'Full Stack Developer'],
    level: 'Beginner',
    prerequisites: ['None - suitable for beginners'],
    officialUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    preparationTime: '3-4 months',
    cost: 'Subscription / Financial Aid available',
    category: 'Frontend Development',
  },
  {
    name: 'AWS Certified Cloud Practitioner (CLF-C02)',
    provider: 'Amazon Web Services',
    description: 'Validates overall knowledge of AWS Cloud platform, services, core architecture, pricing, billing, and security models.',
    skills: ['AWS', 'Cloud Computing', 'Cloud Architecture', 'Security'],
    targetRoles: ['Cloud Engineer', 'DevOps Engineer', 'Software Engineer', 'Java Full Stack Developer'],
    level: 'Beginner',
    prerequisites: ['Basic IT knowledge'],
    officialUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    preparationTime: '3-5 weeks',
    cost: '$100 USD',
    category: 'Cloud & Infrastructure',
  },
  {
    name: 'Google Data Analytics Professional Certificate',
    provider: 'Google / Coursera',
    description: 'Comprehensive program preparing learners for entry-level data analyst positions using SQL, R, Tableau, and spreadsheets.',
    skills: ['SQL', 'Data Analysis', 'Tableau', 'Data Cleaning', 'Spreadsheets'],
    targetRoles: ['Data Analyst', 'Business Intelligence Analyst'],
    level: 'Beginner',
    prerequisites: ['None - introductory certification'],
    officialUrl: 'https://grow.google/certificates/data-analytics/',
    preparationTime: '3-6 months',
    cost: 'Subscription / Financial Aid available',
    category: 'Data & Analytics',
  },
  {
    name: 'Docker Certified Associate (DCA)',
    provider: 'Mirantis / Docker',
    description: 'Validates skills in container orchestration, image creation and registry management, container security, and troubleshooting.',
    skills: ['Docker', 'Containers', 'DevOps', 'Orchestration'],
    targetRoles: ['DevOps Engineer', 'Cloud Engineer', 'Backend Developer'],
    level: 'Intermediate',
    prerequisites: ['6+ months experience with Docker in production'],
    officialUrl: 'https://www.mirantis.com/software-and-services/docker-certification/',
    preparationTime: '6-8 weeks',
    cost: '$195 USD',
    category: 'Cloud & Infrastructure',
  },
  {
    name: 'Certified Kubernetes Administrator (CKA)',
    provider: 'Linux Foundation & CNCF',
    description: 'Performance-based certification proving hands-on skills in deploying, configuring, and managing production Kubernetes clusters.',
    skills: ['Kubernetes', 'DevOps', 'Linux', 'Cluster Management'],
    targetRoles: ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer'],
    level: 'Advanced',
    prerequisites: ['Linux command line, Docker, networking'],
    officialUrl: 'https://www.cncf.io/certification/cka/',
    preparationTime: '2-3 months',
    cost: '$395 USD',
    category: 'Cloud & Infrastructure',
  },
  {
    name: 'HashiCorp Certified: Terraform Associate',
    provider: 'HashiCorp',
    description: 'Demonstrates understanding of open-source Infrastructure as Code concepts, Terraform Cloud, and provisioning infrastructure.',
    skills: ['Terraform', 'Infrastructure as Code', 'Cloud Architecture', 'DevOps'],
    targetRoles: ['DevOps Engineer', 'Cloud Engineer'],
    level: 'Intermediate',
    prerequisites: ['Basic cloud architecture experience (AWS/GCP/Azure)'],
    officialUrl: 'https://www.hashicorp.com/certification/terraform-associate',
    preparationTime: '4-6 weeks',
    cost: '$70.50 USD',
    category: 'Cloud & Infrastructure',
  },
];

export async function seedCatalog() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for catalog seed');

  // Insert or update courses
  let coursesAdded = 0;
  for (const c of initialCourses) {
    const existing = await Course.findOne({ title: c.title });
    if (!existing) {
      await Course.create(c);
      coursesAdded++;
    }
  }

  // Insert or update certifications
  let certsAdded = 0;
  for (const cert of initialCertifications) {
    const existing = await Certification.findOne({ name: cert.name });
    if (!existing) {
      await Certification.create(cert);
      certsAdded++;
    }
  }

  console.log(`Catalog seed complete. Added ${coursesAdded} courses, ${certsAdded} certifications.`);
  console.log(`Total Courses: ${await Course.countDocuments()}`);
  console.log(`Total Certifications: ${await Certification.countDocuments()}`);

  await mongoose.disconnect();
}

if (process.argv[1]?.endsWith('seedCatalog.js')) {
  seedCatalog().catch((err) => {
    console.error('Seed catalog error:', err);
    process.exit(1);
  });
}
