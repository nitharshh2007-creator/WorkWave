export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: 'Full Time' | 'Internship' | 'Part Time';
  salary: {
    min: number;
    max: number;
  };
  applicants: number;
  skills: string[];
  postedDate: string;
  deadline: string;
  companyDescription: string;
  description: string;
}

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'InnovateTech',
    logo: 'I',
    location: 'Bengaluru, India',
    type: 'Internship',
    salary: { min: 25000, max: 35000 },
    applicants: 128,
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'GraphQL', 'JavaScript', 'HTML5', 'CSS3'],
    postedDate: '3d ago',
    deadline: '30 July 2026',
    companyDescription: 'InnovateTech is a leading provider of cloud-based solutions, empowering businesses to achieve digital transformation. We are passionate about creating cutting-edge technology that drives progress and fosters a collaborative and inclusive work environment.',
    description: `
    <p>InnovateTech is seeking a motivated Frontend Developer Intern to join our dynamic team. This is a fantastic opportunity to work on real-world projects and gain hands-on experience with modern web technologies.</p>
    <br/>
    <h4>Responsibilities:</h4>
    <ul>
      <li>Develop and maintain user-facing features using React.js and TypeScript.</li>
      <li>Collaborate with UI/UX designers to translate designs and wireframes into high-quality code.</li>
      <li>Optimize components for maximum performance across a vast array of web-capable devices and browsers.</li>
      <li>Participate in code reviews and contribute to a collaborative engineering environment.</li>
    </ul>
    <br/>
    <h4>What we're looking for:</h4>
    <ul>
      <li>Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model.</li>
      <li>Thorough understanding of React.js and its core principles.</li>
      <li>Familiarity with modern frontend build pipelines and tools.</li>
      <li>A knack for benchmarking and optimization.</li>
    </ul>
  `,
  },
  {
    id: '2',
    title: 'UI/UX Design Intern',
    company: 'CreativeMinds',
    logo: 'C',
    location: 'Pune, India',
    type: 'Internship',
    salary: { min: 20000, max: 30000 },
    applicants: 95,
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    postedDate: '1d ago',
    deadline: '28 July 2026',
    companyDescription: 'CreativeMinds is a design-focused agency that helps brands tell their stories through beautiful and effective user experiences.',
    description: `
    <p>CreativeMinds is looking for a talented UI/UX Design Intern to help shape the user experience of our products. You will work closely with our design and product teams to create intuitive and visually appealing interfaces.</p>
    <br/>
    <h4>Responsibilities:</h4>
    <ul>
      <li>Create wireframes, storyboards, user flows, and site maps.</li>
      <li>Design graphic user interface elements, like menus, tabs, and widgets.</li>
      <li>Develop UI mockups and prototypes that clearly illustrate how sites function and look.</li>
    </ul>
    <br/>
    <h4>What we're looking for:</h4>
    <ul>
      <li>A portfolio of design projects.</li>
      <li>Up-to-date knowledge of design software like Adobe Illustrator and Photoshop.</li>
      <li>Team spirit; strong communication skills to collaborate with various stakeholders.</li>
    </ul>
  `,
  },
  {
    id: '3',
    title: 'Backend Developer (Node.js)',
    company: 'DataCore Solutions',
    logo: 'D',
    location: 'Hyderabad, India',
    type: 'Full Time',
    salary: { min: 80000, max: 120000 },
    applicants: 72,
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Docker'],
    postedDate: '5d ago',
    deadline: '05 Aug 2026',
    companyDescription: 'DataCore Solutions specializes in robust backend systems and data management, providing scalable infrastructure for modern applications.',
    description: `
    <p>DataCore Solutions is hiring an experienced Backend Developer to build and maintain the server-side of our web applications. You will be responsible for managing the interchange of data between the server and the users.</p>
    <br/>
    <h4>Responsibilities:</h4>
    <ul>
      <li>Integration of user-facing elements developed by a front-end developer with server-side logic.</li>
      <li>Writing reusable, testable, and efficient code.</li>
      <li>Design and implementation of low-latency, high-availability, and performant applications.</li>
    </ul>
  `,
  },
  {
    id: '4',
    title: 'Data Analyst',
    company: 'AnalyticsHub',
    logo: 'A',
    location: 'Mumbai, India',
    type: 'Full Time',
    salary: { min: 60000, max: 90000 },
    applicants: 210,
    skills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel'],
    postedDate: '2w ago',
    deadline: '10 Aug 2026',
    companyDescription: 'AnalyticsHub is a data analytics firm dedicated to helping businesses make data-driven decisions through powerful insights and visualizations.',
    description: `
    <p>AnalyticsHub is seeking a Data Analyst to turn data into information, information into insight, and insight into business decisions. You will conduct full lifecycle analysis to include requirements, activities, and design.</p>
    <br/>
    <h4>Responsibilities:</h4>
    <ul>
      <li>Interpret data, analyze results using statistical techniques.</li>
      <li>Develop and implement databases, data collection systems, data analytics, and other strategies.</li>
      <li>Acquire data from primary or secondary data sources and maintain databases.</li>
    </ul>
  `,
  },
  {
    id: '5',
    title: 'Full Stack Developer',
    company: 'CodeWave',
    logo: 'C',
    location: 'Remote',
    type: 'Full Time',
    salary: { min: 100000, max: 150000 },
    applicants: 150,
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'TypeScript'],
    postedDate: '1w ago',
    deadline: '15 Aug 2026',
    companyDescription: 'CodeWave is a software development company that builds high-quality, full-stack solutions for a variety of clients, with a focus on remote collaboration.',
    description: `
    <p>CodeWave is looking for a Full Stack Developer to produce scalable software solutions. You’ll be part of a cross-functional team that’s responsible for the full software development life cycle, from conception to deployment.</p>
    <br/>
    <h4>Responsibilities:</h4>
    <ul>
      <li>Work with development teams and product managers to ideate software solutions.</li>
      <li>Design client-side and server-side architecture.</li>
      <li>Build the front-end of applications through appealing visual design.</li>
    </ul>
  `,
  },
  {
    id: '6',
    title: 'Python Developer Intern',
    company: 'LogicLeap',
    logo: 'L',
    location: 'Chennai, India',
    type: 'Internship',
    salary: { min: 22000, max: 28000 },
    applicants: 88,
    skills: ['Python', 'Django', 'Flask', 'SQL'],
    postedDate: '6d ago',
    deadline: '25 July 2026',
    companyDescription: 'LogicLeap is a forward-thinking tech company that nurtures new talent through impactful internship programs, focusing on Python and backend technologies.',
    description: `
    <p>LogicLeap is offering an internship for a Python Developer. This role involves writing and testing code, debugging programs, and integrating applications with third-party web services.</p>
    <br/>
    <h4>Responsibilities:</h4>
    <ul>
      <li>Writing effective, scalable code.</li>
      <li>Developing back-end components to improve responsiveness and overall performance.</li>
      <li>Integrating user-facing elements into applications.</li>
    </ul>
  `,
  },
];