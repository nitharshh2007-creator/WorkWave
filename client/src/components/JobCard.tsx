type JobProps = {
  title: string;
  company: string;
  location: string;
};

function JobCard({
  title,
  company,
  location,
}: JobProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <p>{company}</p>
      <p>{location}</p>

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
        Apply Now
      </button>
    </div>
  );
}

export default JobCard;